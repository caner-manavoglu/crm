# CRM — Geliştirme TODO Listesi

Projenin mevcut durumuna göre eklenmesi gereken tüm özellikler ve iyileştirmeler. Öncelik sırası: **P0 (hızlı kazanım / kritik) → P3 (iyileştirme)**.

---

## P0 — Müşteri Deneyimi (Kritik)

- [ ] **Şifre sıfırlama akışı**
  - [ ] `POST /auth/forgot-password` (e-posta + token üretimi)
  - [ ] `POST /auth/reset-password`
  - [ ] FE: `/auth/forgot` ve `/auth/reset?token=...` sayfaları
  - [ ] Login sayfasına "Şifremi unuttum" linki
- [x] **Self-servis kayıt linki**
  - [ ] LandingPage'e "Hesap Oluştur" girişi (Login üzerinden erişiliyor; landing'e ileride)
  - [x] LoginPage altına "Kayıt Ol" linki + "Şifremi Unuttum (yakında)" placeholder
  - [x] `/register` rotası App.tsx'e bağlandı
- [x] **Dosya / fotoğraf eki**
  - [x] `attachments` tablosu (`complaintId`, `storageKey`, `originalName`, `mimeType`, `sizeBytes`, `uploadedById`)
  - [x] `POST /complaints/:id/attachments` (multer + yerel `backend/uploads/attachments/`)
  - [x] `GET /attachments/:id` (yetki kontrolü + stream)
  - [x] `DELETE /attachments/:id` (yükleyici veya admin)
  - [x] Public track endpoint'leri: `POST/GET /complaints/track/:code/attachments` + `GET /attachments/track/:code/:id`
  - [x] FE: `AttachmentPanel` (drag-drop) — Customer/Staff/Admin detay + Track sayfası
  - [x] Boyut 10MB + mime whitelist (jpg/png/webp/pdf)
  - [ ] FE: SubmitComplaintPage'e form-içi yükleme (post-create flow) — ileride
- [x] **Çözüm sonrası müşteri puanlama (CSAT)**
  - [x] `complaint_ratings` tablosu (`complaintId` unique, `score 1-5`, `comment`, `createdAt`)
  - [x] `POST /complaints/:id/rate` (sadece RESOLVED/CLOSED, sadece müşteri-owner, 1 kez)
  - [x] `GET /complaints/:id/rating` + `GET /ratings/stats` (admin)
  - [x] Track response'a `rating` eklendi (public görünüm)
  - [x] FE: `RatingCard` Customer detay sayfasında
  - [x] FE: TrackComplaintPage'de mevcut puanlama görünür
  - [x] Analytics'e CSAT kartı (ort. puan + 1-5 dağılımı)
- [ ] **Şikayeti yeniden açma (reopen)**
  - [ ] `POST /complaints/:id/reopen` (Resolved → In Progress, gerekçe zorunlu)
  - [ ] History'ye not düşülmeli, ilgili personele bildirim
  - [ ] FE: müşteri detayında Resolved durumunda "Çözüm yetersiz, yeniden aç" butonu
- [x] **Müşteri ⇄ personel mesajlaşma**
  - [x] `complaint_messages` tablosu (`complaintId`, `senderId`, `body`, `isInternal`, `createdAt`)
  - [x] `GET/POST /complaints/:id/messages` (yetki kontrolü)
  - [x] `isInternal` mesajları sadece staff/admin görür; müşteri iç not oluşturamaz
  - [x] Socket ile canlı: `notifyComplaintThread` + `complaint:subscribe/unsubscribe` (auth gerekli)
  - [x] FE: `MessageThread` Customer/Staff/Admin detay sayfalarında
- [x] **Takip sayfasında rate limit**
  - [x] `@nestjs/throttler` global kurulum
  - [x] `/complaints/track/:code` için 10 req/dk
  - [x] `/auth/login`, `/auth/register` için sıkı limit (5 req/dk)
  - [x] `POST /complaints` (anonim) için 5 req/dk per IP

---

## P0 — Bildirim Altyapısı

- [ ] **Persisted notifications**
  - [ ] `notifications` tablosu (`userId`, `type`, `payload`, `link`, `readAt`)
  - [ ] `GET /notifications` (paginated)
  - [ ] `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`
  - [ ] Mevcut socket emit'leri DB'ye de yazsın
  - [ ] FE: header'da bell ikonu + okunmamış sayısı + dropdown liste
- [ ] **E-posta entegrasyonu**
  - [ ] Nodemailer kurulumu (SMTP config — `.env`)
  - [ ] Şablonlar (handlebars veya basit string template):
    - [ ] Yeni şikayet açıldı → takip kodu
    - [ ] Atama yapıldı (müşteriye)
    - [ ] Durum değişti
    - [ ] Çözüm tamamlandı + puanlama linki
    - [ ] Şifre sıfırlama
  - [ ] `MailService` (NotificationsModule'a ekle)
  - [ ] Dev'de Mailtrap / Mailhog, prod'da Resend/SendGrid
- [ ] **SMS opsiyonel (Twilio/Netgsm)**
  - [ ] Sadece kritik olaylar: çözüm tamamlandı, randevu hatırlatma
  - [ ] User'a SMS opt-in tercihi

---

## P1 — Admin / Operasyon

- [x] **AllComplaintsPage filtre/arama genişletme**
  - [x] Backend: `complaints.findAll` query'sine `q` (başlık/içerik/takip kodu/kategori ILIKE) — `priority`, `cityId`, `departmentId`, `fromDate`, `toDate` zaten vardı
  - [x] FE: filtre çubuğu (debounced search input + priority/city select + tarih aralığı + "Filtreleri Temizle")
  - [ ] URL query sync (`useSearchParams`) — ileride
- [ ] **Toplu işlem (bulk actions)**
  - [ ] Tabloya checkbox sütunu + "Tümünü seç"
  - [ ] Bulk endpoint'ler: `POST /complaints/bulk-close`, `bulk-assign`, `bulk-transfer`, `bulk-delete`
  - [ ] FE: seçim toolbar'ı (X seçili — Kapat / Ata / Yönlendir / Sil)
- [ ] **CSV / Excel export**
  - [ ] `GET /complaints/export?...` (mevcut filtrelerle, UTF-8 CSV BOM)
  - [ ] Analytics ekranı için `GET /analytics/export`
  - [ ] FE: "Dışa Aktar" butonu
- [ ] **SLA / vade takibi**
  - [ ] `categories.slaHours` (admin düzenleyebilir)
  - [ ] `complaints.dueAt` (oluşturulurken hesapla)
  - [ ] Liste ekranlarında "Gecikti" / "X saat kaldı" rozeti
  - [ ] Cron: SLA dolmadan 2 saat önce ve dolduğunda notify
  - [ ] Analytics: SLA içinde çözülme oranı
- [ ] **Activity / audit log**
  - [ ] `activity_logs` tablosu (`userId`, `action`, `entity`, `entityId`, `before`, `after`, `ip`, `createdAt`)
  - [ ] Interceptor veya servis seviyesinde mutation'larda yazılsın
  - [ ] Admin ekranı: `/admin/audit-log` (filtre: user, entity, tarih)
- [ ] **AdminComplaintDetailPage'i sekmeli birleşik görünüm**
  - [ ] Özet / Geçmiş / Çözüm Süreci / Mesajlar / Ekler / Atama Geçmişi
  - [ ] Aksiyon butonları (kapat / ata / transfer / sil) tek yerde
- [ ] **Personel performans drill-down**
  - [ ] `GET /users/staff/:id/performance` (SLA oranı, ort. çözüm süresi, CSAT, son 30 gün trend)
  - [ ] FE: `/admin/staff/:id` profil sayfası
- [ ] **Kategori/şehir silme uyarısı**
  - [ ] Silmeden önce bağlı aktif şikayet sayısını göster
  - [ ] >0 ise "Önce talepleri taşıyın" mesajı

---

## P1 — Personel Deneyimi

- [ ] **Vardiya / uygunluk takvimi**
  - [ ] `availability_slots` tablosu (`staffId`, `weekday`, `startTime`, `endTime`)
  - [ ] CRUD endpoint'leri
  - [ ] Otomatik atama bu slot'lara saygı duysun
  - [ ] FE: haftalık takvim grid'i
- [ ] **Personel transferi self-servis**
  - [ ] FE: ComplaintWorkPage'e "Devret" butonu (mevcut `transfer` endpoint'ini kullan)
  - [ ] Hedef personel seçimi + gerekçe
  - [ ] Opsiyonel admin onayı (flag)
- [ ] **Personel bugün/agenda görünümü**
  - [ ] StaffDashboardPage'e "Bugün yapılacaklar": aktif adımlar + SLA yakın olanlar
- [ ] **Personel önceliği**
  - [ ] "Otomatik almayı geçici kapat" + "Acil durumda da al" toggle'ları
  - [ ] `staff_availability`'ye flag alanları

---

## P2 — Çözüm Süreci Motoru

- [ ] **Adımlara not / ek**
  - [ ] `complaint_resolution_steps.notes` (text)
  - [ ] Adım-attachment ilişkisi
  - [ ] FE: adım tamamlarken not + dosya
- [ ] **Adım sahibi (rol/departman)**
  - [ ] `resolution_process_steps.assignedRoleOrDepartment` opsiyonel
  - [ ] Adım o rol/departman dışı kullanıcı tarafından tamamlanamasın
- [ ] **Şartlı dallanma (v2 — sadece tasarım taslağı çıkar)**
  - [ ] Adım sonuçlarına bağlı sonraki adım seçimi
  - [ ] Şimdilik araştırma TODO'su
- [ ] **Süreç versiyonlama**
  - [ ] `resolution_processes.version`
  - [ ] Devam eden talepleri yeni versiyona geçirme aksiyonu (opsiyonel)

---

## P2 — Dashboard / Analitik

- [ ] **Gerçek zamanlı KPI**
  - [ ] Dashboard sayılarını socket ile canlı güncelle
- [ ] **Şehir / departman ısı haritası**
  - [ ] Türkiye haritası SVG + şikayet yoğunluğu (renkli)
- [ ] **Saatlik dağılım grafiği**
  - [ ] Peak hours tespiti için
- [ ] **Cevap süresi metrikleri**
  - [ ] First response time, resolution time ortalamaları
- [ ] **Tekrar eden müşteri sayısı**
  - [ ] Müşteri × şikayet kümeleri

---

## P1 — Güvenlik & Altyapı

- [ ] **Throttling** (P0 ile birleşik kurulum, burada genişletme)
  - [ ] Global default + endpoint bazlı override
- [ ] **Refresh token rotation doğrulaması**
  - [ ] Token blacklist veya jti tracking
- [x] **`.env.example` dosyası** (backend/.env.example oluşturuldu)
- [x] **CORS'u çoklu-origin destekler hale getir**
  - [x] `notifications.gateway.ts` + `main.ts` — virgülle ayrılmış `FRONTEND_URL`
- [ ] **Soft delete**
  - [ ] `complaints.deletedAt` + TypeORM `@DeleteDateColumn`
  - [ ] Admin "Silinenler" görünümü + geri yükleme
  - [ ] DELETE artık soft, gerçek silme cron ile 30 gün sonra
- [x] **ValidationPipe sıkılaştırma** (zaten mevcuttu: whitelist + forbidNonWhitelisted + transform)
- [x] **Helmet + compression middleware** (main.ts)
- [x] **Health check endpoint** (`GET /api/health` — Terminus DB ping)

---

## P2 — UX / Kullanılabilirlik

- [x] **Toast bildirim sistemi** (sonner kuruldu, App.tsx'e Toaster eklendi)
  - [x] AllComplaintsPage edit / transfer / close / delete toast'a taşındı
  - [ ] Diğer sayfaların mutation'ları (Submit, Track, staff/admin detay) — ileride
- [ ] **Optimistic update**
  - [ ] Silme / durum değişimi gibi UI'da hızlı tepki
- [ ] **Empty state görselleri**
  - [ ] İllüstrasyon + CTA içeren boş durum komponenti
- [ ] **Tablo iyileştirmeleri**
  - [ ] Sütun bazlı sıralama
  - [ ] Satır seçimi (bulk actions için zaten gerekli)
  - [ ] Sütun yoğunluğu (compact/comfortable) toggle
- [ ] **Mobil cilası**
  - [ ] Tüm sayfaları gerçek mobil viewport'ta test et
  - [ ] Mobil tablo → kart görünümü
- [ ] **Erişilebilirlik**
  - [ ] Tüm icon-only butonlara `aria-label` (AllComplaintsPage filtreleri kapsandı, geri kalanlar bekliyor)
  - [ ] Modal'larda focus trap (`focus-trap-react` veya manuel)
  - [x] Popover menü `Esc` ile kapansın (AllComplaintsPage popover + tüm modal'lar)
  - [ ] Renk kontrastı denetimi (WCAG AA)
- [ ] **i18n**
  - [ ] `i18next` veya `react-intl` kurulumu
  - [ ] TR + EN baz dil paketi
  - [ ] Dil seçici header'da
- [ ] **Tema toggle (dark/light)**
  - [ ] Material tokens hazır, sadece toggle gerekiyor
  - [ ] Sistem tercihine saygı + localStorage

---

## P3 — Veri / Teknik Temizlik

- [ ] **MyComplaintsPage server-side pagination**
  - [ ] `useMyComplaints` query params kabul etsin, slice'ı kaldır
- [ ] **`run-seed.ts` entity listesini otomatikleştir**
  - [ ] `glob('src/**/*.entity.{ts,js}')` ile dinamik
- [ ] **FE generic'leri sıkılaştır**
  - [ ] `Record<string, unknown>` yerine somut tipler
  - [ ] API response wrapping için generic `ApiResponse<T>`
- [ ] **Test altyapısı**
  - [ ] Backend: Jest + supertest ile e2e (en azından auth + complaints akışı)
  - [ ] Frontend: Vitest + React Testing Library kritik akışlar
- [ ] **CI**
  - [ ] GitHub Actions: lint + typecheck + test
- [ ] **Docker prod hazırlık**
  - [ ] Multi-stage Dockerfile (backend + frontend nginx)
  - [ ] `docker-compose.prod.yml`
- [ ] **API dokümantasyonu**
  - [ ] Swagger zaten kurulu, eksik DTO açıklamalarını tamamla
  - [ ] README'ye Swagger URL ekle

---

## Önerilen Yol Haritası

### Sprint 1 (1–2 gün) — Quick Wins
1. AllComplaintsPage filtre/arama + bulk actions
2. Rate limit (throttler) + e-posta ile takip kodu
3. Persisted notifications + header bell

### Sprint 2 (2–3 gün) — Müşteri Yaşam Döngüsü
4. Dosya eki (attachments)
5. Müşteri puanlama (CSAT)
6. Reopen akışı
7. Şifre sıfırlama

### Sprint 3 (2–3 gün) — Operasyonel Olgunluk
8. SLA / vade takibi
9. Mesajlaşma
10. Audit log + soft delete

### Sprint 4 (1–2 gün) — Polish
11. Toast + optimistic update
12. Erişilebilirlik düzeltmeleri
13. i18n iskelet
14. CSV export
