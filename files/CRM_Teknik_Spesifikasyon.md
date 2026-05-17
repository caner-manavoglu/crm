# CRM UYGULAMASI - TEKNİK SPESİFİKASYON

## 1. BACKEND MIMARISI

### 1.1 Proje Yapısı

```
crm-backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── environment.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Complaint.ts
│   │   ├── Department.ts
│   │   ├── Category.ts
│   │   └── ...
│   ├── services/
│   │   ├── ComplaintService.ts
│   │   ├── AssignmentService.ts
│   │   ├── UserService.ts
│   │   ├── NotificationService.ts
│   │   └── AnalyticsService.ts
│   ├── controllers/
│   │   ├── ComplaintController.ts
│   │   ├── UserController.ts
│   │   ├── AdminController.ts
│   │   └── ...
│   ├── middlewares/
│   │   ├── authMiddleware.ts
│   │   ├── errorHandler.ts
│   │   └── validator.ts
│   ├── routes/
│   │   ├── complaints.ts
│   │   ├── users.ts
│   │   ├── admin.ts
│   │   └── ...
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   ├── jobs/
│   │   ├── assignmentQueue.ts
│   │   └── notificationQueue.ts
│   └── app.ts
├── migrations/
│   ├── 001_create_users.sql
│   ├── 002_create_departments.sql
│   └── ...
├── .env.example
├── docker-compose.yml
└── package.json
```

### 1.2 Express Server Yapısı (app.ts)

```typescript
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { io as ioServer } from 'socket.io';
import { createServer } from 'http';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = ioServer(httpServer, {
  cors: { origin: process.env.FRONTEND_URL, credentials: true }
});

// Middleware
app.use(cors());
app.use(express.json());

// Authentication Middleware
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      (req as any).user = decoded;
    } catch (err) {
      // Token invalid, devam et (public route olabilir)
    }
  }
  next();
});

// Routes
import complaintRoutes from './routes/complaints';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';

app.use('/api/complaints', complaintRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Socket.io Events
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('staff:subscribe', (staffId: string) => {
    socket.join(`staff:${staffId}`);
  });

  socket.on('admin:subscribe', () => {
    socket.join('admin');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, io };
```

### 1.3 Veritabanı Bağlantısı (PostgreSQL)

```typescript
// src/config/database.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Query helper
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`Slow query (${duration}ms): ${text}`);
    }
    return result;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

export { pool };
```

### 1.4 Redis Caching (Müsaitlik)

```typescript
// src/config/redis.ts
import redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis connected');
});

// Helper functions
export const getStaffAvailability = async (staffId: string) => {
  const key = `staff:${staffId}:availability`;
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
};

export const setStaffAvailability = async (staffId: string, data: any) => {
  const key = `staff:${staffId}:availability`;
  await redisClient.setEx(key, 3600, JSON.stringify(data)); // 1 hour expiry
};

export const incrementStaffLoad = async (staffId: string) => {
  const key = `staff:${staffId}:load`;
  const result = await redisClient.incr(key);
  return result;
};

export const decrementStaffLoad = async (staffId: string) => {
  const key = `staff:${staffId}:load`;
  const result = await redisClient.decr(key);
  return result;
};

export { redisClient };
```

### 1.5 Atama Servisi (Core Logic)

```typescript
// src/services/AssignmentService.ts
import { query } from '../config/database';
import { incrementStaffLoad, decrementStaffLoad } from '../config/redis';
import { NotificationService } from './NotificationService';
import { v4 as uuidv4 } from 'uuid';

export class AssignmentService {
  
  /**
   * En müsait personeli bul (Dinamik Atama)
   */
  static async findMostAvailableStaff(departmentId: string, cityId: string) {
    const result = await query(`
      SELECT u.id, u.ad_soyad, u.email,
             COALESCE(sa.mevcut_gucuk, 0) as current_load,
             COALESCE(sa.maksimum_gucuk, 4) as max_capacity
      FROM users u
      LEFT JOIN staff_availability sa ON u.id = sa.personel_id
      WHERE u.departman_id = $1 
        AND u.sehir_id = $2
        AND u.aktif = true
        AND (sa.mevcut_gucuk IS NULL OR sa.mevcut_gucuk < sa.maksimum_gucuk)
      ORDER BY (sa.mevcut_gucuk IS NULL OR sa.mevcut_gucuk) ASC, u.id
      LIMIT 1
    `, [departmentId, cityId]);

    return result.rows[0] || null;
  }

  /**
   * Şikayeti personele ata
   */
  static async assignComplaint(complaintId: string, staffId: string, assignmentType: 'manual' | 'otomatik' | 'havuz_dan') {
    const client = await query('SELECT 1'); // Get a connection
    
    try {
      // Başlangıç
      await query('BEGIN');

      // 1. Şikayeti güncelle
      await query(`
        UPDATE complaints
        SET personel_id = $1, durum = 'atandi', updated_at = NOW()
        WHERE id = $2
      `, [staffId, complaintId]);

      // 2. Atama kaydı oluştur
      const assignmentId = uuidv4();
      await query(`
        INSERT INTO assignments (id, sikayet_id, personel_id, atama_turu, atama_tarihi)
        VALUES ($1, $2, $3, $4, NOW())
      `, [assignmentId, complaintId, staffId, assignmentType]);

      // 3. Personel müsaitliğini güncelle
      await incrementStaffLoad(staffId);

      // 4. Müsaitlik kaydını veritabanında güncelle
      const currentLoad = await query(`
        SELECT COUNT(*) as count FROM assignments
        WHERE personel_id = $1 AND durum IN ('atandi', 'calisiliyor')
      `, [staffId]);

      await query(`
        INSERT INTO staff_availability (id, personel_id, mevcut_gucuk, maksimum_gucuk, son_guncelleme)
        VALUES ($1, $2, $3, 4, NOW())
        ON CONFLICT (personel_id) 
        DO UPDATE SET mevcut_gucuk = $3, son_guncelleme = NOW()
      `, [uuidv4(), staffId, currentLoad.rows[0].count]);

      // 5. Tamamla
      await query('COMMIT');

      return { success: true, assignmentId };
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }

  /**
   * Şikayeti havuza düşür (Müsait personel yoksa)
   */
  static async moveToPool(complaintId: string, reason: string) {
    await query(`
      UPDATE complaints
      SET durum = 'beklemede', updated_at = NOW()
      WHERE id = $1
    `, [complaintId]);

    // Admin'e bildir
    await NotificationService.notifyAdmins({
      title: 'Beklemede Şikayet',
      message: `Şikayet #${complaintId} hiçbir personele atanamadı.`,
      type: 'warning',
      reason
    });
  }

  /**
   * Şikayeti kapat
   */
  static async closeComplaint(complaintId: string, staffId: string, responseNote: string) {
    try {
      // Şikayeti güncelle
      await query(`
        UPDATE complaints
        SET durum = 'kapalı', cevap_notu = $1, tamamlandi_at = NOW(), updated_at = NOW()
        WHERE id = $2
      `, [responseNote, complaintId]);

      // Personel yükünü azalt
      await decrementStaffLoad(staffId);

      // Atama tamamlansın
      await query(`
        UPDATE assignments
        SET tamamlanma_tarihi = NOW()
        WHERE sikayet_id = $1
      `, [complaintId]);

      // Müşteriye bildir
      const complaintData = await query(`
        SELECT musteri_id FROM complaints WHERE id = $1
      `, [complaintId]);

      await NotificationService.notifyUser(complaintData.rows[0].musteri_id, {
        title: 'Şikayetiniz Kapatıldı',
        message: responseNote,
        type: 'success'
      });

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Şikayeti başka personele transfer et
   */
  static async transferComplaint(complaintId: string, fromStaffId: string, toStaffId: string, reason: string) {
    try {
      // Eski personel yükünü azalt
      await decrementStaffLoad(fromStaffId);

      // Yeni personel yükünü artır
      await incrementStaffLoad(toStaffId);

      // Atama kaydını güncelle
      await query(`
        UPDATE assignments
        SET personel_id = $1, atama_tarihi = NOW()
        WHERE sikayet_id = $2
      `, [toStaffId, complaintId]);

      // Şikayeyi güncelle
      await query(`
        UPDATE complaints
        SET personel_id = $1, updated_at = NOW()
        WHERE id = $2
      `, [toStaffId, complaintId]);

      // Her iki personele de bildir
      await NotificationService.notifyUser(fromStaffId, {
        title: 'Görev Transfer Edildi',
        message: `Şikayet #${complaintId} başka bir personele transfer edildi. Nedeni: ${reason}`,
        type: 'info'
      });

      await NotificationService.notifyUser(toStaffId, {
        title: 'Yeni Görev Atandı',
        message: `Şikayet #${complaintId} size transfer edildi.`,
        type: 'success'
      });

      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}
```

### 1.6 Bildirim Servisi

```typescript
// src/services/NotificationService.ts
import nodemailer from 'nodemailer';
import { io } from '../app';

export class NotificationService {
  static transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  /**
   * Gerçek zamanlı bildirim (Socket.io)
   */
  static notifyStaff(staffId: string, notification: any) {
    io.to(`staff:${staffId}`).emit('notification:new', {
      id: require('uuid').v4(),
      timestamp: new Date(),
      read: false,
      ...notification
    });
  }

  /**
   * Admin'i bildir
   */
  static notifyAdmins(notification: any) {
    io.to('admin').emit('notification:admin', {
      id: require('uuid').v4(),
      timestamp: new Date(),
      ...notification
    });
  }

  /**
   * Email gönder
   */
  static async sendEmail(to: string, subject: string, htmlContent: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: htmlContent
      });
    } catch (error) {
      console.error('Email sending failed:', error);
    }
  }

  /**
   * SMS gönder (Twilio example)
   */
  static async sendSMS(phoneNumber: string, message: string) {
    // Twilio implementation
    // const twilio = require('twilio');
    // const client = twilio(accountSid, authToken);
    // await client.messages.create({
    //   body: message,
    //   from: '+1234567890',
    //   to: phoneNumber
    // });
  }

  /**
   * Müşteriye bildir
   */
  static async notifyUser(userId: string, notification: any) {
    // In-app
    io.to(`user:${userId}`).emit('notification:new', notification);
    
    // Email + SMS (database'de preference'a göre)
  }
}
```

### 1.7 Cron Jobs (Otomatik Atama)

```typescript
// src/jobs/assignmentQueue.ts
import cron from 'node-cron';
import { query } from '../config/database';
import { AssignmentService } from '../services/AssignmentService';

export const initAssignmentQueue = () => {
  /**
   * Her 5 dakikada havuzdaki şikayetleri kontrol et ve atamaya çalış
   */
  cron.schedule('*/5 * * * *', async () => {
    console.log('Running pool assignment check...');
    
    try {
      // Havuzdaki şikayetleri al
      const pooledComplaints = await query(`
        SELECT id, departman_id, sehir_id
        FROM complaints
        WHERE durum = 'beklemede' 
        AND created_at > NOW() - INTERVAL '30 minutes'
        ORDER BY created_at ASC
      `);

      for (const complaint of pooledComplaints.rows) {
        // Müsait personel bul
        const availableStaff = await AssignmentService.findMostAvailableStaff(
          complaint.departman_id,
          complaint.sehir_id
        );

        if (availableStaff) {
          // Ata
          await AssignmentService.assignComplaint(
            complaint.id,
            availableStaff.id,
            'havuz_dan'
          );
          console.log(`Assigned complaint ${complaint.id} to ${availableStaff.id}`);
        }
      }
    } catch (error) {
      console.error('Pool assignment error:', error);
    }
  });

  /**
   * Her saat başında istatistikleri güncelle
   */
  cron.schedule('0 * * * *', async () => {
    console.log('Updating statistics...');
    
    try {
      const stats = await query(`
        SELECT 
          COUNT(*) as total_complaints,
          COUNT(CASE WHEN durum = 'kapalı' THEN 1 END) as closed_complaints,
          COUNT(CASE WHEN durum = 'beklemede' THEN 1 END) as pooled_complaints
        FROM complaints
        WHERE created_at > NOW() - INTERVAL '24 hours'
      `);

      // Cache'e kaydet veya analitik servise gönder
      console.log('Daily stats:', stats.rows[0]);
    } catch (error) {
      console.error('Statistics update error:', error);
    }
  });
};
```

## 2. FRONTEND MIMARISI

### 2.1 Proje Yapısı (React)

```
crm-frontend/
├── src/
│   ├── components/
│   │   ├── Complaint/
│   │   │   ├── ComplaintForm.tsx
│   │   │   ├── ComplaintList.tsx
│   │   │   └── ComplaintDetail.tsx
│   │   ├── Staff/
│   │   │   ├── StaffDashboard.tsx
│   │   │   ├── AssignmentList.tsx
│   │   │   └── AssignmentDetail.tsx
│   │   ├── Admin/
│   │   │   ├── AdminPanel.tsx
│   │   │   ├── StaffManagement.tsx
│   │   │   ├── DepartmentManagement.tsx
│   │   │   └── CategoryManagement.tsx
│   │   └── Common/
│   │       ├── Header.tsx
│   │       ├── Navigation.tsx
│   │       └── Layout.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── socket.ts
│   │   └── auth.ts
│   ├── store/
│   │   ├── index.ts
│   │   ├── complaintSlice.ts
│   │   ├── userSlice.ts
│   │   └── notificationSlice.ts
│   ├── pages/
│   │   ├── ComplaintPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── AdminPage.tsx
│   ├── styles/
│   │   ├── global.css
│   │   └── variables.css
│   └── App.tsx
├── .env.example
├── vite.config.ts
└── package.json
```

### 2.2 Complaint Form Bileşeni

```typescript
// src/components/Complaint/ComplaintForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { socket } from '../../services/socket';

interface ComplaintFormData {
  categoryId: string;
  departmentId: string;
  cityId: string;
  staffId?: string;
  title: string;
  description: string;
  priority: 'düşük' | 'normal' | 'yüksek' | 'acil';
  autoAssign: boolean;
}

export const ComplaintForm: React.FC = () => {
  const { register, handleSubmit, watch, setValue } = useForm<ComplaintFormData>();
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const categoryId = watch('categoryId');
  const cityId = watch('cityId');
  const autoAssign = watch('autoAssign', true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [catRes, cityRes] = await Promise.all([
        api.get('/categories'),
        api.get('/cities')
      ]);
      setCategories(catRes.data);
      setCities(cityRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Kategori değişirse departmanı otomatik belirle
  useEffect(() => {
    if (categoryId) {
      const selected = categories.find((c: any) => c.id === categoryId);
      if (selected) {
        setValue('departmentId', selected.departman_id);
        loadDepartmentStaff(selected.departman_id, cityId);
      }
    }
  }, [categoryId]);

  // Şehir değişirse personel listesini güncelle
  useEffect(() => {
    if (cityId && departments.length) {
      const deptId = watch('departmentId');
      loadDepartmentStaff(deptId, cityId);
    }
  }, [cityId]);

  const loadDepartmentStaff = async (deptId: string, city: string) => {
    try {
      const res = await api.get(`/staff/availability`, {
        params: { departmentId: deptId, cityId: city }
      });
      setStaffList(res.data);
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  const onSubmit = async (data: ComplaintFormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        staffId: data.autoAssign ? null : data.staffId
      };

      const res = await api.post('/complaints', payload);

      if (res.data.success) {
        setMessage(`✓ Şikayetiniz başarıyla kaydedildi. Takip No: ${res.data.trackingNumber}`);
        
        // Socket ile personele bildir
        if (data.staffId) {
          socket.emit('complaint:assigned', {
            staffId: data.staffId,
            complaintId: res.data.complaintId
          });
        }
      } else {
        setMessage(`⚠ Şikayetiniz havuza alındı. Çok yakında bir personel tarafından incelenecektir.`);
      }
    } catch (error) {
      setMessage('✗ Hata: Şikayet gönderme başarısız');
      console.error('Error submitting complaint:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label>Kategori *</label>
        <select {...register('categoryId', { required: true })}>
          <option value="">Kategori Seçin</option>
          {categories.map((cat: any) => (
            <option key={cat.id} value={cat.id}>{cat.ad}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Şehir *</label>
        <select {...register('cityId', { required: true })}>
          <option value="">Şehir Seçin</option>
          {cities.map((city: any) => (
            <option key={city.id} value={city.id}>{city.ad}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Departman (Otomatik) *</label>
        <input 
          {...register('departmentId')} 
          disabled 
          placeholder="Kategori seçilince otomatik doldurulur"
        />
      </div>

      <div className="form-group">
        <label>
          <input type="checkbox" {...register('autoAssign')} defaultChecked />
          Otomatik Ata
        </label>
      </div>

      {!autoAssign && staffList.length > 0 && (
        <div className="form-group">
          <label>Personel Seçin</label>
          <select {...register('staffId')}>
            <option value="">Personel Seçin</option>
            {staffList.map((staff: any) => (
              <option key={staff.id} value={staff.id}>
                {staff.ad_soyad} ({staff.mevcut_gucuk}/{staff.maksimum_gucuk})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label>Başlık *</label>
        <input 
          {...register('title', { required: true, maxLength: 255 })} 
          placeholder="Şikayetin başlığı"
        />
      </div>

      <div className="form-group">
        <label>Açıklama *</label>
        <textarea 
          {...register('description', { required: true, minLength: 10 })} 
          placeholder="Detaylı açıklama..."
          rows={5}
        />
      </div>

      <div className="form-group">
        <label>Öncelik</label>
        <select {...register('priority')}>
          <option value="normal">Normal</option>
          <option value="düşük">Düşük</option>
          <option value="yüksek">Yüksek</option>
          <option value="acil">Acil</option>
        </select>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Gönderiliyor...' : 'Şikayeti Gönder'}
      </button>

      {message && <div className="message">{message}</div>}
    </form>
  );
};
```

### 2.3 Socket.io İstemci

```typescript
// src/services/socket.ts
import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = () => {
  socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
    auth: {
      token: localStorage.getItem('authToken')
    }
  });

  socket.on('connect', () => {
    console.log('Socket connected');
    
    // Kullanıcı tipine göre subscribe et
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'staff') {
      const staffId = localStorage.getItem('userId');
      socket.emit('staff:subscribe', staffId);
    } else if (userRole === 'admin') {
      socket.emit('admin:subscribe');
    }
  });

  socket.on('notification:new', (notification) => {
    console.log('New notification:', notification);
    // Redux store'a dispatch et
    dispatch(addNotification(notification));
  });

  socket.on('availability:updated', (data) => {
    console.log('Availability updated:', data);
    // UI'ı güncelle
  });

  socket.on('complaint:assigned', (data) => {
    console.log('New complaint assigned:', data);
    // Görev listesini güncelle
  });

  return socket;
};

export { socket };
```

### 2.4 Redux Store Örneği

```typescript
// src/store/complaintSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: string;
  staffId?: string;
  created_at: string;
  [key: string]: any;
}

interface ComplaintState {
  items: Complaint[];
  loading: boolean;
  error: string | null;
  total: number;
}

export const fetchComplaints = createAsyncThunk(
  'complaints/fetchComplaints',
  async (params: any) => {
    const res = await api.get('/complaints', { params });
    return res.data;
  }
);

const complaintSlice = createSlice({
  name: 'complaints',
  initialState: {
    items: [],
    loading: false,
    error: null,
    total: 0
  } as ComplaintState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaints.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error fetching complaints';
      });
  }
});

export default complaintSlice.reducer;
```

## 3. VERİTABANI MİGRASYONLARI

### 3.1 Initial Migration

```sql
-- migrations/001_initial_schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cities
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad VARCHAR(255) NOT NULL UNIQUE,
  kod VARCHAR(10),
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad VARCHAR(255) NOT NULL UNIQUE,
  aciklama TEXT,
  sehir_id UUID REFERENCES cities(id),
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad VARCHAR(255) NOT NULL UNIQUE,
  aciklama TEXT,
  departman_id UUID REFERENCES departments(id),
  aktif BOOLEAN DEFAULT true,
  ikona VARCHAR(50),
  renk VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  ad_soyad VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'customer',
  departman_id UUID REFERENCES departments(id),
  sehir_id UUID REFERENCES cities(id),
  aktif BOOLEAN DEFAULT true,
  telefon VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaints
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  musteri_id UUID NOT NULL REFERENCES users(id),
  kategori_id UUID NOT NULL REFERENCES categories(id),
  departman_id UUID NOT NULL REFERENCES departments(id),
  sehir_id UUID NOT NULL REFERENCES cities(id),
  personel_id UUID REFERENCES users(id),
  baslik VARCHAR(255) NOT NULL,
  icerik TEXT NOT NULL,
  durum VARCHAR(50) DEFAULT 'yeni',
  oncelik VARCHAR(50) DEFAULT 'normal',
  cevap_notu TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tamamlandi_at TIMESTAMP NULL
);

-- Assignments
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sikayet_id UUID UNIQUE NOT NULL REFERENCES complaints(id),
  personel_id UUID NOT NULL REFERENCES users(id),
  atayan_id UUID REFERENCES users(id),
  atama_turu VARCHAR(50) DEFAULT 'otomatik',
  atama_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tamamlanma_tarihi TIMESTAMP NULL,
  degerlendirme INTEGER CHECK (degerlendirme >= 1 AND degerlendirme <= 5),
  yorum TEXT
);

-- Staff Availability
CREATE TABLE staff_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  personel_id UUID UNIQUE NOT NULL REFERENCES users(id),
  maksimum_gucuk INTEGER DEFAULT 4,
  mevcut_gucuk INTEGER DEFAULT 0,
  son_guncelleme TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaint History
CREATE TABLE complaint_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sikayet_id UUID NOT NULL REFERENCES complaints(id),
  eski_durum VARCHAR(50),
  yeni_durum VARCHAR(50),
  degistiren_id UUID REFERENCES users(id),
  degisiklik_aciklamasi TEXT,
  degisiklik_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_complaints_status ON complaints(durum);
CREATE INDEX idx_complaints_department ON complaints(departman_id);
CREATE INDEX idx_complaints_city ON complaints(sehir_id);
CREATE INDEX idx_complaints_staff ON complaints(personel_id);
CREATE INDEX idx_assignments_staff ON assignments(personel_id);
CREATE INDEX idx_users_department ON users(departman_id);
CREATE INDEX idx_staff_availability_load ON staff_availability(mevcut_gucuk);

-- Audit Log (Future use)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(255),
  table_name VARCHAR(100),
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 4. DEPLOYMENT YAPILANDI

### 4.1 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DB_NAME:-crm_db}
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-password}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "5000:5000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend/src:/app/src

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      REACT_APP_API_URL: ${API_URL:-http://localhost:5000}
    ports:
      - "3000:3000"
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
  redis_data:
```

### 4.2 Nginx Configuration

```nginx
# nginx.conf
upstream backend {
  server backend:5000;
}

upstream frontend {
  server frontend:3000;
}

server {
  listen 80;
  server_name _;

  client_max_body_size 50M;

  # Frontend
  location / {
    proxy_pass http://frontend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  # API
  location /api/ {
    proxy_pass http://backend/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # Socket.io
  location /socket.io {
    proxy_pass http://backend/socket.io;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
  }
}
```

---

## 5. TEST STRATEJİSİ

### 5.1 Unit Tests (Jest)

```typescript
// __tests__/AssignmentService.test.ts
import { AssignmentService } from '../src/services/AssignmentService';

describe('AssignmentService', () => {
  it('should find the most available staff', async () => {
    // Mock data
    const departmentId = 'dept-1';
    const cityId = 'city-1';

    // Test
    const staff = await AssignmentService.findMostAvailableStaff(departmentId, cityId);

    // Assert
    expect(staff).toBeDefined();
    expect(staff.id).toBeDefined();
    expect(staff.mevcut_gucuk).toBeLessThan(staff.maksimum_gucuk);
  });

  it('should assign a complaint successfully', async () => {
    const complaintId = 'complaint-1';
    const staffId = 'staff-1';

    const result = await AssignmentService.assignComplaint(
      complaintId,
      staffId,
      'otomatik'
    );

    expect(result.success).toBe(true);
    expect(result.assignmentId).toBeDefined();
  });
});
```

### 5.2 Integration Tests

```typescript
// __tests__/complaintFlow.test.ts
import request from 'supertest';
import { app } from '../src/app';

describe('Complaint Flow', () => {
  it('should create complaint and auto-assign', async () => {
    const response = await request(app)
      .post('/api/complaints')
      .send({
        categoryId: 'cat-1',
        departmentId: 'dept-1',
        cityId: 'city-1',
        title: 'Test Complaint',
        description: 'This is a test complaint',
        priority: 'normal',
        autoAssign: true
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.personelId).toBeDefined();
  });
});
```

---

Bu dokümantasyon, CRM uygulamasının tamamlanması için gerekli olan tüm teknik detayları içermektedir. Her bölüm gerçek implementasyona hazır kod örnekleri ve en iyi uygulamaları içerir.

