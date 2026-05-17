# CRM UYGULAMASI - DETAYLI PROJE PLANI

## 1. PROJE GENEL BAKIŞ

### 1.1 Proje Adı
Akıllı Müşteri Şikayet Yönetim Sistemi (CRM)

### 1.2 Ana Hedefler
- Müşteri şikayetlerinin merkezi yönetimi
- Otomatik ve akıllı şikayet atama sistemi
- Personel iş yükü dengelemesi
- Kategori ve departman bazlı şikayet yönlendirmesi
- Gerçek zamanlı bildirim ve raporlama

### 1.3 Başlıca Özellikler
1. Müşteri şikayet giriş arayüzü
2. Dinamik personel müsaitlik görüntüleme
3. Kategori ve departman yönetimi
4. Konum (şehir) bazlı atama
5. Beklemede kalan şikayetler havuzu
6. Personel görev yönetimi arayüzü
7. Admin kontrol paneli
8. Dashboard ve raporlama

---

## 2. TEKNOLOJİ STACKİ

### 2.1 Frontend
- **Framework**: React.js (Vite)
- **UI Kütüphanesi**: Shadcn/ui veya Material UI
- **Durum Yönetimi**: Redux Toolkit veya Zustand
- **HTTP İstemci**: Axios
- **Gerçek Zamanlı**: Socket.io (websocket)
- **Grafik/Raporlama**: Chart.js, Recharts
- **Form Yönetimi**: React Hook Form

### 2.2 Backend
- **Runtime**: Node.js
- **Framework**: Express.js veya NestJS
- **Veritabanı**: PostgreSQL (ilişkisel, güvenilir)
- **Gerçek Zamanlı**: Socket.io
- **Authentication**: JWT (JSON Web Tokens)
- **Caching**: Redis (personel müsaitlik için)
- **Job Queue**: Bull veya RabbitMQ (arka plan görevleri)

### 2.3 Altyapı
- **Deployment**: Docker + Docker Compose
- **Web Sunucusu**: Nginx
- **Hosting**: AWS EC2, Azure VM veya VPS
- **Veritabanı Backup**: Otomatik günlük yedekler

### 2.4 Araçlar
- **Versiyon Kontrol**: Git + GitHub/GitLab
- **CI/CD**: GitHub Actions veya GitLab CI
- **Monitoring**: Sentry (hata takibi), Prometheus
- **Loglama**: Winston veya Pino

---

## 3. VERİTABANI ŞEMASI

### 3.1 Ana Tablolar

#### users (Personel)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  ad_soyad VARCHAR(255) NOT NULL,
  role ENUM('customer', 'staff', 'admin') DEFAULT 'customer',
  departman_id UUID FOREIGN KEY,
  sehir_id UUID FOREIGN KEY,
  aktif BOOLEAN DEFAULT true,
  telefon VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### departments (Departmanlar)
```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY,
  ad VARCHAR(255) NOT NULL UNIQUE,
  aciklama TEXT,
  sehir_id UUID FOREIGN KEY,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### categories (Şikayet Kategorileri)
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  ad VARCHAR(255) NOT NULL UNIQUE,
  aciklama TEXT,
  departman_id UUID FOREIGN KEY (kategori için hedef departman),
  aktif BOOLEAN DEFAULT true,
  ikona VARCHAR(50),
  renk VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### cities (Şehirler)
```sql
CREATE TABLE cities (
  id UUID PRIMARY KEY,
  ad VARCHAR(255) NOT NULL UNIQUE,
  kod VARCHAR(10),
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### complaints (Şikayetler)
```sql
CREATE TABLE complaints (
  id UUID PRIMARY KEY,
  musteri_id UUID FOREIGN KEY (user tablosuna),
  kategori_id UUID FOREIGN KEY,
  departman_id UUID FOREIGN KEY,
  sehir_id UUID FOREIGN KEY,
  personel_id UUID FOREIGN KEY (atanan kişiye),
  baslik VARCHAR(255) NOT NULL,
  icerik TEXT NOT NULL,
  durum ENUM('yeni', 'atandi', 'calisiliyor', 'beklemede', 'kapalı', 'reddedildi') DEFAULT 'yeni',
  oncelik ENUM('düşük', 'normal', 'yüksek', 'acil') DEFAULT 'normal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tamamlandi_at TIMESTAMP NULL,
  cevaplan_at TIMESTAMP NULL,
  cevap_notu TEXT
);
```

#### assignments (Atamalar)
```sql
CREATE TABLE assignments (
  id UUID PRIMARY KEY,
  sikayet_id UUID FOREIGN KEY,
  personel_id UUID FOREIGN KEY,
  atayan_id UUID FOREIGN KEY (admin veya sistem),
  atama_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atama_turu ENUM('manual', 'otomatik', 'havuz_dan') DEFAULT 'otomatik',
  tamamlanma_tarihi TIMESTAMP NULL,
  degerlendirme INTEGER (1-5 yıldız),
  yorum TEXT
);
```

#### staff_availability (Personel Müsaitlik)
```sql
CREATE TABLE staff_availability (
  id UUID PRIMARY KEY,
  personel_id UUID FOREIGN KEY,
  maksimum_gucuk INTEGER DEFAULT 4,
  mevcut_gucuk INTEGER DEFAULT 0,
  son_guncelleme TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### complaint_history (Şikayet Geçmişi)
```sql
CREATE TABLE complaint_history (
  id UUID PRIMARY KEY,
  sikayet_id UUID FOREIGN KEY,
  eski_durum VARCHAR(50),
  yeni_durum VARCHAR(50),
  degistiren_id UUID FOREIGN KEY,
  degisiklik_aciklamasi TEXT,
  degisiklik_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. ARAYÜZ TASARIMI VE AKIŞLARI

### 4.1 Müşteri Arayüzü

#### Şikayet Oluşturma Sayfası
1. **Kategori Seçimi**: Dropdown listesi
   - Seçilen kategori → otomatik departman gösterimi
   - Departman değiştirilebilir

2. **Şehir Seçimi**: Dropdown
   - Şehire göre o departmandaki personel listesi gösterilir

3. **Personel Seçimi (İsteğe Bağlı)**:
   - "Personel seç veya otomatik ata" toggle
   - Seçim yapılırsa: personelin müsaitlik seviyesi (0/4, 1/4, vb.) gösterilir
   - Otomatik ata seçilirse: sistem en müsait personele atayacak

4. **Şikayet Detayları**:
   - Başlık (zorunlu)
   - Açıklama (zorunlu)
   - Dosya yükleme (isteğe bağlı - resim, doküman)
   - Öncelik seçimi (düşük, normal, yüksek, acil)

5. **Gönderme ve Onay**:
   - Şikayet başarılı atandıysa: "Şikayetiniz başarıyla kaydedildi" + takip numarası
   - Personel atanamamışsa: havuza düştüğü bilgisi

#### Müşteri Takip Sayfası
- Geçmiş şikayetleri görüntüle
- Şikayet durumunu (yeni, atandı, çalışılıyor, kapalı) takip et
- Cevapları ve notları oku

---

### 4.2 Personel Arayüzü

#### Ana Dashboard
1. **Görev Özeti**:
   - Atanmış görevler listesi
   - Her bir görevin durumu
   - Yüksek öncelikli görevler vurgulu

2. **Şikayet Listelemesi**:
   - Filtreler: Durum, Departman, Şehir, Tarih aralığı
   - Sıralama: Ön Öncelik, Oluş tarihi, Yaklaştırılmış bitme tarihi
   - Arama: Başlık, Takip numarası

3. **Personel Müsaitlik Göstergesi**:
   - Şu anki görev sayısı (2/4, 3/4 vb.)
   - Maksimum görev kapasitesi
   - Müsaitlik durumu (Yeşil = müsait, Sarı = yakında dolu, Kırmızı = dolu)

#### Görev Detay Sayfası
- Şikayet metni ve ekler
- Müşteri bilgileri
- Geçmiş notları
- Görev durumunu güncelle: "Çalışılıyor" → "Kapalı"
- Not ve cevap yazma
- Görev sonlandırma + değerlendirme

#### Personel Listesi (Departman Bazında)
- Eğer personel isterse, şikayeti direkt departmana iletebilir
- Departmandaki diğer müsait personeli görmek

---

### 4.3 Admin Kontrol Paneli

#### Personel Yönetimi
- Personel ekle/sil/düzenle
- Personel → Departman ataması
- Personel → Şehir ataması
- Maksimum görev kapasitesi belirle
- Personel rolü yönetimi (staff, admin)

#### Departman Yönetimi
- Departman ekle/sil/düzenle
- Departman → Şehir ilişkilerini tanımla
- Departman başkanı atama

#### Kategori Yönetimi
- Kategori ekle/sil/düzenle
- Kategori → Departman eşlemesi
- Kategori ikonu ve rengi
- Kategori aktif/pasif

#### Şehir Yönetimi
- Şehir ekle/sil/düzenle
- Departmanlara şehir atama

#### Şikayet Yönetimi
- Tüm şikayetleri görüntüle
- Atanmamış şikayetler havuzunu görüntüle
- Manuel atama yapma
- Beklemede kalan şikayetleri tekrar atamayı tetikle

#### İstatistikler ve Raporlar
- Toplam şikayet sayısı
- Personel başına ortalama şikayet
- Departman başına şikayet sayısı
- Ortalama çözüm süresi
- Kullanıcı memnuniyet puanları
- Kategori bazında şikayet dağılımı
- Şehir bazında şikayet dağılımı
- Grafik: Zaman içinde şikayet trendi

---

## 5. BİZNES MANTIKLARI

### 5.1 Otomatik Atama Algoritması

#### Senaryo 1: Müşteri Tarafından Personel Seçilerek Atama
```
1. Müşteri kategori seçer → departman otomatik belirlenir
2. Müşteri şehir seçer
3. Müşteri personeli seçer (müsait mi kontrol et)
4. Eğer müsait ise: görev ata, müsaitlik sayacını artır
5. Eğer müsait değilse: hata mesajı göster, havuza at
```

#### Senaryo 2: Müşteri Tarafından Otomatik Atama
```
1. Müşteri kategori seçer → departman otomatik
2. Müşteri şehir seçer
3. "Otomatik ata" seçer
4. Sistem: Seçilen şehir + departmanda en müsait personeli bul
5. Eğer müsait personel varsa: ota, bildirim gönder
6. Eğer müsait personel yoksa: havuza at, admin'e bildir
```

#### Senaryo 3: Personel Tarafından Departmana İletme
```
1. Personel şikayeti görür
2. "Departmana iletkay" seçer
3. Sistem: Aynı departmanda en müsait personeli bul
4. Atama yapılır, orijinal personel bildirim alır
```

#### Senaryo 4: Personel Tarafından Şehir Seçerek İletme
```
1. Personel şikayeti görür
2. Şehir seçer + "Atama yap" denir
3. Sistem: Seçilen şehir + şikayetin departmanında en müsait personeli bulur
4. Ata ve bildirim gönder
```

#### Havuza Düşen Şikayet Tetikleme
```
Cron Job (her 5 dakikada):
1. Havuzda > 30 dakika olan şikayetleri kontrol et
2. O anda müsait personel var mı?
3. Varsa: atama yap
4. Yoksa: admin'e bildi ve e-posta gönder
```

### 5.2 Müsaitlik Hesaplaması

```javascript
// Gerçek zamanlı müsaitlik güncellemesi

function updateAvailability(staffId) {
  const activeAssignments = db.query(
    `SELECT COUNT(*) as count 
    FROM assignments 
    WHERE personel_id = ? AND durum IN ('atandi', 'calisiliyor')`
  );
  
  const maxCapacity = staff.maksimum_gucuk; // 4
  const currentLoad = activeAssignments;
  
  redis.set(`staff:${staffId}:load`, currentLoad);
  
  // Socket.io ile tüm bağlı istemcilere bildir
  io.emit('availability_updated', {
    staffId,
    current: currentLoad,
    max: maxCapacity,
    status: currentLoad >= maxCapacity ? 'full' : 'available'
  });
}
```

### 5.3 Bildirim Sistemi

#### Bildirim Tipleri
1. **Şikayet Atandı**: Personele şikayet atandı → SMS/Email/In-app
2. **Şikayet Ataması Başarısız**: Admin'e havuza düştüğü bildiri
3. **Beklemede Kalan Şikayet**: Müşteriye güncelleme
4. **Görev Değerlendirmesi**: Müşteriye kapanan görev geri bildirimi

#### Bildirim Kanalları
- In-app notification (Socket.io - gerçek zamanlı)
- Email (nodemailer)
- SMS (Twilio veya benzeri - opsiyonel)

---

## 6. IMPLEMENTASYON AŞAMALARI

### Faz 1: Temel Yapı ve Veri Tabanı (2-3 hafta)
- [ ] Backend API yapısı
- [ ] Veritabanı şeması ve migrasyonlar
- [ ] Autentikasyon (JWT)
- [ ] Temel CRUD operasyonları
- [ ] Docker konfigürasyonu

### Faz 2: Müşteri Arayüzü (2-3 hafta)
- [ ] Şikayet oluşturma formu
- [ ] Kategori/Departman/Şehir dropdown'ları
- [ ] Personel müsaitlik görüntüleme
- [ ] Şikayet takip sayfası
- [ ] Temel responsive tasarım

### Faz 3: Otomatik Atama Sistemi (2-3 hafta)
- [ ] Atama algoritması
- [ ] Redis caching (müsaitlik)
- [ ] Havuz yönetimi
- [ ] Cron job'ları
- [ ] Bildirim sistemi

### Faz 4: Personel Arayüzü (2-3 hafta)
- [ ] Görev listesi
- [ ] Görev detay sayfası
- [ ] Durumu güncelleme
- [ ] Not/Cevap sistemi
- [ ] Filtre ve arama

### Faz 5: Admin Paneli (2-3 hafta)
- [ ] Personel yönetimi
- [ ] Departman yönetimi
- [ ] Kategori yönetimi
- [ ] Şehir yönetimi
- [ ] Manuel atama
- [ ] Havuz yönetimi

### Faz 6: Dashboard ve Raporlar (2 hafta)
- [ ] İstatistik sayfası
- [ ] Grafik/Özetler
- [ ] Filtreleme seçenekleri
- [ ] CSV/PDF export
- [ ] Zaman bazında analizler

### Faz 7: Test ve Optimizasyon (1-2 hafta)
- [ ] Unit testler
- [ ] Integration testler
- [ ] Performance testi
- [ ] Hata giderme
- [ ] Dokümantasyon

### Faz 8: Deployment ve Bakım (1 hafta)
- [ ] Production ortamında deploy
- [ ] Monitoring kurulumu
- [ ] Backup otomasyonu
- [ ] Eğitim ve destek

---

## 7. API ENDPOINT'LERİ (Genel Yapı)

### Müşteri Endpoints
```
POST   /api/complaints              - Şikayet oluştur
GET    /api/complaints/:id          - Şikayet detayı
GET    /api/complaints              - Müşterinin şikayetlerini listele
GET    /api/staff/availability      - Personel müsaitliği görüntüle
GET    /api/departments             - Departmanları listele
GET    /api/categories              - Kategorileri listele
GET    /api/cities                  - Şehirleri listele
```

### Personel Endpoints
```
GET    /api/staff/assignments       - Atanan görevler
GET    /api/assignments/:id         - Görev detayı
PUT    /api/assignments/:id/status  - Görev durumunu güncelle
POST   /api/assignments/:id/note    - Görev notuna açıklama ekle
POST   /api/assignments/:id/transfer - Görev transfer et
GET    /api/staff/:id/availability  - Kendi müsaitliği
GET    /api/staff/list              - Departmandaki diğer personeller
```

### Admin Endpoints
```
# Personel
POST   /api/admin/staff             - Personel ekle
PUT    /api/admin/staff/:id         - Personel güncelle
DELETE /api/admin/staff/:id         - Personel sil
GET    /api/admin/staff             - Tüm personeli listele

# Departman
POST   /api/admin/departments       - Departman ekle
PUT    /api/admin/departments/:id   - Departman güncelle
DELETE /api/admin/departments/:id   - Departman sil
GET    /api/admin/departments       - Tüm departmanları listele

# Kategori
POST   /api/admin/categories        - Kategori ekle
PUT    /api/admin/categories/:id    - Kategori güncelle
DELETE /api/admin/categories/:id    - Kategori sil

# Şikayet Yönetimi
GET    /api/admin/complaints/pool   - Havuzdaki şikayetler
PUT    /api/admin/complaints/:id/assign - Manuel atama
GET    /api/admin/analytics         - İstatistikler
GET    /api/admin/reports/...       - Çeşitli raporlar
```

---

## 8. GÜVENLIK ÖNLEMLERİ

1. **Authentication**: JWT token tabanlı
2. **Authorization**: Role-based access control (RBAC)
3. **Input Validation**: Tüm girdiler valide edilecek
4. **SQL Injection**: Prepared statements kullanılacak
5. **CORS**: Whitelist tabanlı CORS konfigürasyonu
6. **Rate Limiting**: API request'lerine limit
7. **HTTPS**: TLS şifrelemesi zorunlu
8. **Password Hashing**: bcrypt veya Argon2
9. **Audit Log**: Tüm kritik işlemler loglanacak
10. **Data Backup**: Günlük ve haftalık yedekler

---

## 9. PERFORMANS HEDEFLERİ

- Şikayet oluşturma: < 500ms
- Otomatik atama: < 1 saniye
- Personel listesi yüklenmesi: < 300ms
- Dashboard yüklenmesi: < 1 saniye
- Veritabanı sorguları: < 100ms (ortalama)
- API response: < 200ms (ağ hariç)

---

## 10. PROJE KAYNAKLARI VE ROL DAĞILIMI

### Takım Yapısı (Örnek)
- **1 Backend Developer** - API, veri tabanı, iş mantığı
- **1 Frontend Developer** - React UI, UX
- **1 Full Stack Developer** - Entegrasyon, DevOps
- **1 QA Engineer** - Test, kalite kontrol
- **1 Project Manager** - Planlama, koordinasyon
- **1 UI/UX Designer** - Tasarım, prototyping

### Gerekli Araçlar
- IDE: VSCode, WebStorm
- Database: PostgreSQL, pgAdmin
- Version Control: Git, GitHub
- Communication: Slack, Jira
- Design: Figma
- Testing: Jest, Postman, Cypress

---

## 11. RISK YÖNETIMI

| Risk | Olasılık | Etki | Azaltma Stratejisi |
|------|----------|------|-------------------|
| Veri tabanı performans sorunları | Orta | Yüksek | Indexleme, caching, query optimization |
| Personel sayısı büyüyünce scalability | Orta | Yüksek | Microservices mimarisi, load balancing |
| Socket.io bağlantı yönetimi | Düşük | Orta | Connection pooling, graceful disconnect |
| Atama algoritmasının akışkanlaştırılması | Yüksek | Orta | Erken prototype ve kullanıcı testi |
| Admin paneline erişim güvenliği | Düşük | Çok Yüksek | 2FA, audit logging, IP whitelist |
| Veri gizliliği ve KVKK uyumluluğu | Orta | Çok Yüksek | Şifreleme, izin yönetimi, retention policy |

---

## 12. BAŞLANGIÇ KONTROL LİSTESİ

- [ ] Proje repository oluştur
- [ ] Geliştirme ortamı kur (Node.js, PostgreSQL, Redis)
- [ ] Backend starter template hazırla
- [ ] Frontend starter template hazırla
- [ ] Veritabanı migration scriptleri yaz
- [ ] API documentation şablonu kur
- [ ] Takım sohbetini kur
- [ ] Sprint planning ve tasksları oluştur
- [ ] Mock veri generatörü hazırla (test için)
- [ ] Deployment pipeline kurulmasını planla

---

## 13. İLETİŞİM VE RAPORLAMA

### Haftalık Status Raporları
- Tamamlanan görevler
- Mevcut blokallar
- Sonraki hafta hedefleri
- Risk güncellemeleri

### İlerleme Metriksleri
- Story point velocity
- Bug/Issue sayısı
- Test coverage
- Deployment frequency

---

## 14. SONRAKI AŞAMALAR (v2.0)

- AI tabanlı kategori otomatik belirleme
- Müşteri memnuniyet anketi ve otomatik değerlendirme
- Sms/Whatsapp integrasyonu
- Çok dilli arayüz
- Mobile uygulaması
- Predictive analytics
- Machine learning ile atama optimizasyonu
- Video call entegrasyonu
- Self-service portal genişletilmesi

