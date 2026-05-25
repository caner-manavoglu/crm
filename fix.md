# CRM — Bug & Eksiklik Raporu

> Projenin tümü (frontend + backend) okunarak hazırlanmıştır. Maddeler önem
> derecesine göre sıralanmıştır. Her madde: **konum**, **sorun**, **çözüm önerisi**
> içerir. Onay verdiğin maddeleri tek tek uygulayabilirim.

Tarih: 2026-05-25

---

## 🔴 KRİTİK — Güvenlik

### 1. Public register ile yetki yükseltme (privilege escalation)
- **Konum:** `backend/src/modules/auth/dto/register.dto.ts:23-26`, `backend/src/modules/auth/auth.service.ts:30`
- **Sorun:** `RegisterDto` opsiyonel `role` alanı kabul ediyor ve `register()` içinde
  `this.userRepo.create(dto)` ile doğrudan kaydediliyor. `/api/auth/register` ise
  `@Public()`. Yani herkes şu isteği atıp **admin olabilir**:
  ```json
  POST /api/auth/register { "email":"x@x.com", "password":"123456", "name":"a", "surname":"b", "role":"admin" }
  ```
- **Çözüm:** `RegisterDto`'dan `role` (ve gerekirse `departmentId`) alanını kaldır;
  serviste rolü her zaman `UserRole.CUSTOMER` olarak zorla. Personel/admin oluşturma
  yalnızca `POST /api/users` (admin korumalı) üzerinden yapılmalı.

### 2. Şikayetlerde IDOR — herkese açık okuma
- **Konum:** `backend/src/modules/complaints/complaints.controller.ts:43-53`
- **Sorun:** `GET /api/complaints/:id` ve `GET /api/complaints/:id/history` `@Public()`.
  Kimlik doğrulaması olmadan, ID tahmin/iterasyonla **herhangi birinin şikayeti ve
  müşteri bilgileri (PII)** okunabiliyor.
- **Çözüm:** Bu uçları auth'lu yap; müşteri ise yalnızca kendi şikayetini görebilsin
  (`complaint.customerId === user.id`), staff/admin hepsini görebilsin. Public portal
  gerçekten gerekiyorsa ayrı, sınırlı bir uç tasarla.

### 3. `.env` dosyaları git'e commit'lenmiş + `.gitignore` yok
- **Konum:** `/.env`, `/backend/.env` (git ile takip ediliyor), kök dizinde `.gitignore` **yok**
- **Sorun:** Secret'lar (JWT secret, DB şifresi) repoda. Şu an dev placeholder olsa da
  prod değerleri eklenirse sızar; ayrıca `node_modules`, `dist` gibi dizinler de
  ignore edilmiyor olabilir.
- **Çözüm:** Kök ve alt dizinlere `.gitignore` ekle (`.env`, `node_modules`, `dist`,
  `.DS_Store`); `git rm --cached .env backend/.env` ile takipten çıkar; `.env.example`
  kalsın; prod secret'larını rotate et.

### 4. `updateStatus` yetkilendirme kapsamı yok
- **Konum:** `backend/src/modules/complaints/complaints.controller.ts:55-62`, `complaints.service.ts:66-87`
- **Sorun:** `PATCH /api/complaints/:id/status` üzerinde `@Roles` yok → **herhangi bir
  auth'lu kullanıcı** durum değiştirebiliyor. Staff, kendisine atanmamış şikayetleri
  de güncelleyebiliyor; müşteri kendi şikayetini doğrudan `closed`/`resolved` yapabiliyor.
- **Çözüm:** Rolleri kısıtla; staff için "bu şikayet bana mı atanmış" kontrolü ekle;
  müşteri için izinli geçişleri sınırla (ör. yalnızca `closed` onayı). Geçersiz durum
  geçişlerini (state machine) reddet.

---

## 🟠 YÜKSEK — İşlevsel / Veri Bütünlüğü

### 5. Gerçek zamanlı bildirimler tamamen ölü
- **Konum:** `backend/src/modules/notifications/notifications.gateway.ts` (hiçbir yerde inject/çağrı yok), `frontend/src/hooks/useSocket.ts`
- **Sorun:** `NotificationsGateway` export ediliyor ama hiçbir servise enjekte edilmiyor;
  `notifyUser` / `notifyAdmins` / `broadcastAvailabilityUpdate` **hiç çağrılmıyor**.
  Frontend `complaint:assigned`, `complaint:transferred`, `notification:new` event'lerini
  dinliyor ama backend hiç emit etmiyor → bildirim sistemi çalışmıyor.
- **Çözüm:** `NotificationsModule`'ü ilgili modüllere import et; `AssignmentsService`
  (atama/transfer) ve `ComplaintsService` (durum değişimi) içine gateway'i enjekte edip
  ilgili olaylarda `notifyUser(staffId, ...)` / `notifyAdmins(...)` çağır.

### 6. Personel kapasite sızıntısı (currentLoad hiç azalmıyor)
- **Konum:** `backend/src/modules/complaints/complaints.service.ts:66-87`, `staff-availability.service.ts:33-44` (decrementLoad **çağrılmıyor**), `assignments.service.ts`
- **Sorun:** Atamada `currentLoad += 1` yapılıyor ama şikayet `resolved`/`closed`
  olduğunda **azaltılmıyor**; assignment hiçbir zaman `isActive = false` yapılmıyor.
  `decrementLoad` metodu var ama hiç kullanılmıyor. Günlük `syncFromDatabase` ise aktif
  (hiç kapatılmayan) atamaları sayıyor → yük sürekli artar, personel kapasiteye dayanır
  ve otomatik atama almayı bırakır.
- **Çözüm:** Şikayet kapandığında ilgili assignment'ı `isActive = false` yap **ve**
  `decrementLoad(staffId)` çağır (tek transaction'da). Alternatif/ek olarak
  `syncFromDatabase`'i yalnızca açık şikayetlere ait atamaları sayacak şekilde düzelt.

### 7. Şikayet `findOne` — `customer` ilişkisi yüklenmiyor
- **Konum:** `backend/src/modules/complaints/complaints.service.ts:57-64`
- **Sorun:** `findOne` yalnızca `['category', 'city']` yüklüyor. Ama
  `frontend/.../ComplaintWorkPage.tsx` (staff) `complaint.customer?.name` gösteriyor →
  müşteri adı boş geliyor. `category.department` de gerekiyorsa eksik.
- **Çözüm:** İlişkilere `customer` (ve gerekiyorsa `category.department`) ekle.

### 8. Kullanıcı güncellemede şifre hash'lenmiyor
- **Konum:** `backend/src/modules/users/users.service.ts:50-54`
- **Sorun:** `update()` içinde `userRepo.update(id, dto)` kullanılıyor; bu TypeORM çağrısı
  entity'deki `@BeforeUpdate hashPassword()` hook'unu **tetiklemez**. Admin bir
  kullanıcının şifresini güncellerse düz metin olarak kaydedilir.
- **Çözüm:** Şifreyi serviste manuel hash'le, ya da `findOne` + `Object.assign` + `save()`
  kullan (hook'u tetikler). Aynı durum `departments`/`categories` için sorun değil (şifre yok).

---

## 🟡 ORTA — Tutarlılık / UX / İkincil

### 9. ComplaintPoolPage yanlış tasarım sistemi kullanıyor
- **Konum:** `frontend/src/pages/admin/complaints/ComplaintPoolPage.tsx`
- **Sorun:** Sayfanın tamamı açık tema Tailwind class'ları (`bg-white`, `text-gray-900`,
  `border`, `bg-blue-600`) ile yazılmış; uygulamanın koyu tasarım token'larına
  (`surface-container`, `on-surface`, `primary`) uymuyor. Koyu temada görsel olarak bozuk.
- **Çözüm:** `AllComplaintsPage` ile aynı token'lara göre yeniden stille (kart, buton,
  modal, loading spinner dahil).

### 10. Şehir (City) CRUD yok
- **Konum:** `backend/src/modules/cities/*`, `frontend/.../CitiesPage.tsx`
- **Sorun:** Cities yalnızca `findAll` sunuyor; admin Şehirler paneli salt-okunur.
- **Çözüm:** Gerekiyorsa backend'e create/update/delete + DTO ekle, frontend paneli
  tam yönetilebilir yap. (Türkiye'nin 81 ili seed'lendiği için opsiyonel olabilir.)

### 11. Refresh token rotasyonu yok sayılıyor
- **Konum:** `frontend/src/api/axios.ts:33`
- **Sorun:** Backend `refresh` yeni bir refreshToken da döndürüyor; frontend bunu
  yok sayıp eski token'ı tekrar saklıyor (`setTokens(access, refreshToken_old)`).
  7 gün dolana kadar çalışır ama rotasyonun amacını boşa çıkarır.
- **Çözüm:** `setTokens(data.data.accessToken, data.data.refreshToken)` kullan.

### 12. WebSocket gateway CORS `origin: '*'`
- **Konum:** `backend/src/modules/notifications/notifications.gateway.ts:13`
- **Sorun:** REST tarafı `FRONTEND_URL` ile kısıtlıyken socket herkese açık.
- **Çözüm:** `origin`'i `config.frontendUrl` ile kısıtla.

### 13. Bildirimler kalıcı değil (yalnızca client-side)
- **Konum:** `frontend/src/stores/notifications.store.ts` (persist yok), backend'de tablo yok
- **Sorun:** Gateway düzeltilse bile bildirimler yalnızca bellekte; sayfa yenilenince
  kaybolur, geçmiş yok, okundu durumu sunucuda tutulmuyor.
- **Çözüm:** `notifications` tablosu + REST uçları (listele/okundu) ekle; ya da en azından
  store'a zustand `persist` uygula.

### 14. Public şikayet oluşturmada `preferredStaffId` istismarı
- **Konum:** `backend/src/modules/complaints/complaints.controller.ts:23-29`, `assignments.service.ts:33-40`
- **Sorun:** `POST /api/complaints` public; bir misafir `autoAssign:false` +
  `preferredStaffId` göndererek belirli bir personele iş yükleyebilir.
- **Çözüm:** Kimliği doğrulanmamış isteklerde `preferredStaffId`'i yok say; manuel
  hedefleme yalnızca admin akışında olsun.

---

## 🟢 DÜŞÜK — İyileştirme / Tutarlılık

### 15. Soft-delete filtre tutarlılığı
- **Konum:** `backend/src/modules/departments/departments.service.ts:32-35` (+ findAll)
- **Sorun/Çözüm:** `remove` `isActive=false` yapıyor; `findAll`'ın `isActive: true`
  filtrelediğini doğrula (yoksa silinen departmanlar seçim listelerinde görünür).
  Categories tarafı tutarlı (`findAll` `isActive` filtreliyor).

### 16. `processPool` `stillPending` metriği yanıltıcı
- **Konum:** `backend/src/modules/assignments/assignments.service.ts:207`
- **Sorun/Çözüm:** `pendingComplaints.length - assigned`, dept/city eksikliğinden atlanan
  şikayetleri yanlış sayar. Yalnızca log amaçlı; gerçek `pending` sayısını yeniden
  sorgulamak daha doğru olur.

### 17. Sunucu tarafı logout / token iptali yok
- **Konum:** `frontend/.../Topbar.tsx` (client logout), backend'de iptal yok
- **Sorun/Çözüm:** JWT stateless; çıkıştan sonra refresh token süresi dolana dek geçerli
  kalır. Gerekirse refresh token blacklist/rotasyon kaydı ekle.

### 18. Küçük tutarlılıklar
- `frontend/src/pages/auth/RegisterPage.tsx:33` — `authApi.register` yerine doğrudan
  `api.post` çağırıyor (kod tekrarı).
- `frontend/src/api/endpoints/auth.api.ts` — `me()` ve `register()` tipleri kullanılmıyor
  olabilir; ölü kod taraması yapılabilir.
- `complaints.service` guest müşteri için her seferinde sorgu yapıyor; tek seferlik
  cache'lenebilir (önemsiz).

---

## Önerilen uygulama sırası
1. **Güvenlik (1–4)** — özellikle register rol kısıtı, IDOR ve `.gitignore`.
2. **İşlevsel (5–8)** — kapasite sızıntısı ve bildirimler ürünün çekirdek akışı.
3. **Tutarlılık/UX (9, 11, 12)** — hızlı kazanımlar.
4. Kalanlar ihtiyaç/önceliğe göre.

> Not: Yeni eklenen admin panelleri (Personel/Departman/Kategori/Şehir/Analitik),
> staff şikayet sayfaları ve logout butonu önceki turda eklendi/düzeltildi; bu rapor
> onların dışındaki mevcut sorunları kapsar.
