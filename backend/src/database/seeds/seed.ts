import { DataSource } from 'typeorm';
import { City } from '../../modules/cities/entities/city.entity';
import { Department } from '../../modules/departments/entities/department.entity';
import { Category } from '../../modules/categories/entities/category.entity';
import { User } from '../../modules/users/entities/user.entity';
import { StaffAvailability } from '../../modules/staff-availability/entities/staff-availability.entity';
import { ResolutionProcess } from '../../modules/resolution-processes/entities/resolution-process.entity';
import { ResolutionProcessStep } from '../../modules/resolution-processes/entities/resolution-process-step.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

const RESOLUTION_PROCESSES: Record<
  string,
  { name: string; steps: { title: string; description: string }[] }
> = {
  'İnternet Arızası': {
    name: 'İnternet Arızası Çözüm Süreci',
    steps: [
      {
        title: 'Talep kaydı oluşturuldu',
        description:
          'Müşteri talebi sisteme alındı ve takip kodu üretildi. Çağrı merkezi notları arıza kaydına eklendi.',
      },
      {
        title: 'Uzaktan hat ve modem testi',
        description:
          'NOC ekibi tarafından hat sinyal seviyeleri, modem senkronu ve port durumu uzaktan kontrol edilir.',
      },
      {
        title: 'Saha randevusu planlandı',
        description:
          'Sorun uzaktan çözülemediyse müşteriye uygun saatte saha teknisyeni randevusu oluşturulur ve SMS ile bildirilir.',
      },
      {
        title: 'Yerinde teknik müdahale',
        description:
          'Saha ekibi kablo, splitter, modem ve iç tesisat kontrolünü yaparak arızayı giderir; gerekiyorsa donanım değişimi uygular.',
      },
      {
        title: 'Hız ve bağlantı doğrulama testi',
        description:
          'Bağlantı tekrar kurulduktan sonra hız testi ve stabilite ölçümü alınır, sonuçlar kayda eklenir.',
      },
      {
        title: 'Arıza kaydı kapatma ve müşteri teyidi',
        description:
          'Müşteriden hizmetin sorunsuz çalıştığı teyidi alınır; arıza kaydı kapatılır ve memnuniyet SMS\'i gönderilir.',
      },
    ],
  },

  'TV Yayın Sorunu': {
    name: 'TV Yayın Sorunu Çözüm Süreci',
    steps: [
      {
        title: 'Talep kaydı oluşturuldu',
        description:
          'Yayın sorununun türü (donma, sinyal yok, paket eksik vb.) müşteriden alınarak kayda işlendi.',
      },
      {
        title: 'Yayın sinyali uzaktan kontrolü',
        description:
          'Uydu/IPTV altyapısında ilgili bölgedeki yayın akışı ve abonelik paketinin aktif olup olmadığı doğrulanır.',
      },
      {
        title: 'Cihaz yazılım güncellemesi',
        description:
          'Set üstü kutu yazılımının güncel sürüme alınması için uzaktan push işlemi gönderilir.',
      },
      {
        title: 'Saha randevusu planlandı',
        description:
          'Sorun uzaktan giderilemezse müşteriye uygun saatte saha randevusu oluşturulur.',
      },
      {
        title: 'Yerinde anten/uydu ayar kontrolü',
        description:
          'Teknisyen LNB, çanak yönü, kablolama ve set üstü kutu bağlantılarını kontrol eder, gerekli ayarları yapar.',
      },
      {
        title: 'Yayın akışı testi ve onayı',
        description:
          'Birden fazla kanal üzerinde test yapılır, görüntü/ses kalitesi doğrulanır ve müşteri onayı alınır.',
      },
    ],
  },

  'Telefon Arızası': {
    name: 'Telefon Arızası Çözüm Süreci',
    steps: [
      {
        title: 'Talep kaydı oluşturuldu',
        description:
          'Müşterinin tarif ettiği belirti (hat yok, gürültü, tek yönlü ses vb.) kayda işlendi.',
      },
      {
        title: 'Hat sinyal ve gürültü ölçümü',
        description:
          'Santral tarafından hat üzerinde sinyal seviyesi, izolasyon ve gürültü ölçümleri uzaktan yapılır.',
      },
      {
        title: 'Santral tarafı yapılandırma kontrolü',
        description:
          'Numaranın santralde doğru port ve servis tanımına bağlı olduğu doğrulanır; gerekirse yeniden yapılandırılır.',
      },
      {
        title: 'Saha teknisyeni yönlendirme',
        description:
          'Sorun dış tesisat veya bina içi kablolamada ise teknisyen yönlendirilir ve randevu müşteriye iletilir.',
      },
      {
        title: 'Yerinde kablo ve donanım kontrolü',
        description:
          'Sokak kabini, bina giriş kutusu ve abone telefon hattı kontrol edilir, arızalı bileşen değiştirilir.',
      },
      {
        title: 'Test araması ve müşteri onayı',
        description:
          'Çift yönlü test araması yapılır, ses kalitesi doğrulanır ve müşterinin onayı alınarak kayıt kapatılır.',
      },
    ],
  },

  'Fazla Fatura': {
    name: 'Fazla Fatura İtirazı Çözüm Süreci',
    steps: [
      {
        title: 'Talep kaydı oluşturuldu',
        description:
          'İtiraz edilen fatura dönemi, tutar ve şikayet edilen kalem(ler) müşteriden alınarak kayda işlendi.',
      },
      {
        title: 'Fatura kalemlerinin incelenmesi',
        description:
          'Faturadaki tüm hizmet, vergi ve tek seferlik ücret kalemleri abonelik sözleşmesi ile karşılaştırılır.',
      },
      {
        title: 'Kullanım kayıtları ile çapraz doğrulama',
        description:
          'Detay kullanım kayıtları (CDR/data) ile faturadaki tüketim verisi karşılaştırılır; sapma olup olmadığı tespit edilir.',
      },
      {
        title: 'Düzeltme tutarının hesaplanması',
        description:
          'Hatalı kalem tespit edildiyse iade/mahsup tutarı hesaplanır; bulgu yoksa açıklama notu hazırlanır.',
      },
      {
        title: 'İade veya mahsup işleminin uygulanması',
        description:
          'Onaylı düzeltme tutarı sonraki faturaya yansıtılır ya da banka hesabına iade edilir.',
      },
      {
        title: 'Müşteri bilgilendirme ve kaydı kapatma',
        description:
          'İnceleme sonucu ve uygulanan aksiyon yazılı olarak müşteriye iletilir; talep kapatılır.',
      },
    ],
  },

  'Ödeme Sorunu': {
    name: 'Ödeme Sorunu Çözüm Süreci',
    steps: [
      {
        title: 'Talep kaydı oluşturuldu',
        description:
          'Ödeme tarihi, tutarı, kanalı (banka, kredi kartı, otomatik ödeme) müşteriden alınarak kayda işlendi.',
      },
      {
        title: 'Ödeme işlem kayıtlarının teyidi',
        description:
          'Tahsilat sistemi ve banka mutabakat raporlarında ilgili işlem aranır; dekont müşteriden talep edilir.',
      },
      {
        title: 'Hesap mutabakatının yapılması',
        description:
          'Müşterinin abonelik hesabı üzerindeki borç/alacak hareketleri mutabık hale getirilir.',
      },
      {
        title: 'Bakiye düzeltme veya iade onayı',
        description:
          'Eksik tahsilat yansıtılır, mükerrer ödeme tespit edilirse iade için onay süreci başlatılır.',
      },
      {
        title: 'Sonucun müşteriye iletilmesi',
        description:
          'Yapılan işlem detayı SMS/e-posta ile müşteriye bildirilir ve kayıt kapatılır.',
      },
    ],
  },

  'Yeni Hat Kurulum': {
    name: 'Yeni Hat Kurulum Süreci',
    steps: [
      {
        title: 'Başvuru kaydı oluşturuldu',
        description:
          'Müşteri kimlik bilgileri, kurulum adresi ve talep edilen tarife kayda işlendi.',
      },
      {
        title: 'Adres altyapı uygunluk kontrolü',
        description:
          'Belirtilen adresin fiber/bakır altyapı uygunluğu ve port doluluk durumu sorgulanır.',
      },
      {
        title: 'Sözleşme ve evrak süreci',
        description:
          'Hizmet sözleşmesi hazırlanır, müşteri imzasına sunulur ve gerekli belgeler arşivlenir.',
      },
      {
        title: 'Kurulum randevusunun planlanması',
        description:
          'Saha ekibinin müsaitliğine göre kurulum randevusu oluşturulur ve müşteriye SMS ile bildirilir.',
      },
      {
        title: 'Yerinde montaj ve hat aktivasyonu',
        description:
          'Teknisyen kablolama, modem/router kurulumu ve hat aktivasyonunu tamamlar.',
      },
      {
        title: 'Hız/hat testi ve müşteri teslimi',
        description:
          'Hız ve bağlantı testleri yapılır; kullanım kılavuzu teslim edilerek hizmet müşteriye devredilir.',
      },
    ],
  },

  'Cihaz Kurulumu': {
    name: 'Cihaz Kurulumu Süreci',
    steps: [
      {
        title: 'Talep kaydı oluşturuldu',
        description:
          'Kurulacak cihaz türü ve modelinin tespiti, müşteri lokasyon bilgisinin alınması.',
      },
      {
        title: 'Uygun cihaz ve aksesuar tahsisi',
        description:
          'Depo stoğundan müşteri talebine uygun cihaz ve montaj malzemeleri ayrılır.',
      },
      {
        title: 'Sevkiyat planlaması',
        description:
          'Cihaz, en yakın bölge deposuna sevk edilir; saha ekibine teslim kaydı oluşturulur.',
      },
      {
        title: 'Saha kurulum randevusu',
        description:
          'Müşteri ile randevu netleştirilir; öncesinde hatırlatma SMS\'i gönderilir.',
      },
      {
        title: 'Yerinde cihaz kurulumu ve testi',
        description:
          'Teknisyen kurulumu yapar, fonksiyon testlerini gerçekleştirir ve cihazı çalışır durumda teslim eder.',
      },
      {
        title: 'Kullanıcı eğitimi ve teslim tutanağı',
        description:
          'Müşteriye kısa kullanım eğitimi verilir, teslim tutanağı imzalatılarak süreç kapatılır.',
      },
    ],
  },

  'Hizmet Memnuniyeti': {
    name: 'Hizmet Memnuniyeti Değerlendirme Süreci',
    steps: [
      {
        title: 'Geri bildirim kaydı oluşturuldu',
        description:
          'Müşteri geri bildiriminin konusu, ilgili hizmet ve temas noktası kayda işlendi.',
      },
      {
        title: 'Müşteri ile detaylı görüşme',
        description:
          'Müşteri ilişkileri ekibi müşteriyi arayarak yaşadığı deneyimi detaylandırır ve beklentilerini netleştirir.',
      },
      {
        title: 'İlgili birim ile değerlendirme',
        description:
          'Geri bildirim ilgili operasyon/satış/teknik birim ile paylaşılır ve kök neden analizi yapılır.',
      },
      {
        title: 'Aksiyon planı oluşturulması',
        description:
          'Kısa ve uzun vadeli iyileştirme aksiyonları belirlenir; sorumlu ve termin atanır.',
      },
      {
        title: 'Müşteriye geri dönüş yapılması',
        description:
          'Alınan aksiyonlar ve yapılan iyileştirmeler müşteriye yazılı olarak iletilir.',
      },
      {
        title: 'Memnuniyet doğrulama anketi',
        description:
          'Sürecin kapanışında müşteriye kısa bir memnuniyet anketi gönderilir ve sonuç raporlanır.',
      },
    ],
  },

  'Abonelik İptali': {
    name: 'Abonelik İptal Süreci',
    steps: [
      {
        title: 'İptal talebi kaydı oluşturuldu',
        description:
          'Müşterinin iptal gerekçesi, iptal etmek istediği hizmet(ler) ve geçerlilik tarihi kayda işlendi.',
      },
      {
        title: 'Kimlik ve yetkilendirme doğrulaması',
        description:
          'Abonelik sahibi kimliği doğrulanır; vekaleten talep ise yetki belgesi kontrol edilir.',
      },
      {
        title: 'Cayma ve sözleşme şartları kontrolü',
        description:
          'Taahhüt durumu, cayma bedeli ve indirim iadesi gibi sözleşmesel yükümlülükler değerlendirilir.',
      },
      {
        title: 'Cihaz iadesi ve son fatura hesaplaması',
        description:
          'Varsa kiralık cihazların iade süreci başlatılır; kapanış faturası hesaplanarak müşteriye iletilir.',
      },
      {
        title: 'İptal işleminin sistemde tamamlanması',
        description:
          'Abonelik sistem üzerinden pasif duruma alınır, hizmet erişimleri sonlandırılır.',
      },
      {
        title: 'İptal teyit yazısının gönderilmesi',
        description:
          'Müşteriye e-posta/SMS ile resmi iptal teyit bildirimi iletilir ve kayıt kapatılır.',
      },
    ],
  },

  'Sözleşme Uyuşmazlığı': {
    name: 'Sözleşme Uyuşmazlığı Çözüm Süreci',
    steps: [
      {
        title: 'Uyuşmazlık kaydı oluşturuldu',
        description:
          'Müşterinin iddia ettiği uyuşmazlık konusu, ilgili sözleşme ve dönem kayda işlendi.',
      },
      {
        title: 'Sözleşme ve ek belgelerin incelenmesi',
        description:
          'Sözleşme, ekleri, kampanya formları ve müşteri iletişim kayıtları incelenir.',
      },
      {
        title: 'Hukuk müşavirliği değerlendirmesi',
        description:
          'Hukuk birimi ilgili mevzuat ve şirket prosedürleri kapsamında uyuşmazlığı değerlendirir.',
      },
      {
        title: 'Müşteri ile uzlaşma görüşmesi',
        description:
          'Müşteri ile yazılı/sözlü olarak görüşülür; tarafların tutumu ve uzlaşma alanı netleştirilir.',
      },
      {
        title: 'Çözüm önerisinin yazılı sunulması',
        description:
          'Uzlaşma metni veya nihai cevap müşteriye resmi yazı ile iletilir.',
      },
      {
        title: 'Karar uygulaması ve dosyanın kapatılması',
        description:
          'Anlaşmaya varılan aksiyon uygulanır; uzlaşı sağlanamazsa süreç ilgili hukuki mercilere yönlendirilir.',
      },
    ],
  },
};

const CITIES = [
  { name: 'Adana', code: '01' },
  { name: 'Adıyaman', code: '02' },
  { name: 'Afyonkarahisar', code: '03' },
  { name: 'Ağrı', code: '04' },
  { name: 'Amasya', code: '05' },
  { name: 'Ankara', code: '06' },
  { name: 'Antalya', code: '07' },
  { name: 'Artvin', code: '08' },
  { name: 'Aydın', code: '09' },
  { name: 'Balıkesir', code: '10' },
  { name: 'Bilecik', code: '11' },
  { name: 'Bingöl', code: '12' },
  { name: 'Bitlis', code: '13' },
  { name: 'Bolu', code: '14' },
  { name: 'Burdur', code: '15' },
  { name: 'Bursa', code: '16' },
  { name: 'Çanakkale', code: '17' },
  { name: 'Çankırı', code: '18' },
  { name: 'Çorum', code: '19' },
  { name: 'Denizli', code: '20' },
  { name: 'Diyarbakır', code: '21' },
  { name: 'Edirne', code: '22' },
  { name: 'Elazığ', code: '23' },
  { name: 'Erzincan', code: '24' },
  { name: 'Erzurum', code: '25' },
  { name: 'Eskişehir', code: '26' },
  { name: 'Gaziantep', code: '27' },
  { name: 'Giresun', code: '28' },
  { name: 'Gümüşhane', code: '29' },
  { name: 'Hakkari', code: '30' },
  { name: 'Hatay', code: '31' },
  { name: 'Isparta', code: '32' },
  { name: 'Mersin', code: '33' },
  { name: 'İstanbul', code: '34' },
  { name: 'İzmir', code: '35' },
  { name: 'Kars', code: '36' },
  { name: 'Kastamonu', code: '37' },
  { name: 'Kayseri', code: '38' },
  { name: 'Kırklareli', code: '39' },
  { name: 'Kırşehir', code: '40' },
  { name: 'Kocaeli', code: '41' },
  { name: 'Konya', code: '42' },
  { name: 'Kütahya', code: '43' },
  { name: 'Malatya', code: '44' },
  { name: 'Manisa', code: '45' },
  { name: 'Kahramanmaraş', code: '46' },
  { name: 'Mardin', code: '47' },
  { name: 'Muğla', code: '48' },
  { name: 'Muş', code: '49' },
  { name: 'Nevşehir', code: '50' },
  { name: 'Niğde', code: '51' },
  { name: 'Ordu', code: '52' },
  { name: 'Rize', code: '53' },
  { name: 'Sakarya', code: '54' },
  { name: 'Samsun', code: '55' },
  { name: 'Siirt', code: '56' },
  { name: 'Sinop', code: '57' },
  { name: 'Sivas', code: '58' },
  { name: 'Tekirdağ', code: '59' },
  { name: 'Tokat', code: '60' },
  { name: 'Trabzon', code: '61' },
  { name: 'Tunceli', code: '62' },
  { name: 'Şanlıurfa', code: '63' },
  { name: 'Uşak', code: '64' },
  { name: 'Van', code: '65' },
  { name: 'Yozgat', code: '66' },
  { name: 'Zonguldak', code: '67' },
  { name: 'Aksaray', code: '68' },
  { name: 'Bayburt', code: '69' },
  { name: 'Karaman', code: '70' },
  { name: 'Kırıkkale', code: '71' },
  { name: 'Batman', code: '72' },
  { name: 'Şırnak', code: '73' },
  { name: 'Bartın', code: '74' },
  { name: 'Ardahan', code: '75' },
  { name: 'Iğdır', code: '76' },
  { name: 'Yalova', code: '77' },
  { name: 'Karabük', code: '78' },
  { name: 'Kilis', code: '79' },
  { name: 'Osmaniye', code: '80' },
  { name: 'Düzce', code: '81' },
];

export async function runSeed(dataSource: DataSource) {
  const cityRepo = dataSource.getRepository(City);
  const deptRepo = dataSource.getRepository(Department);
  const catRepo = dataSource.getRepository(Category);
  const userRepo = dataSource.getRepository(User);
  const availRepo = dataSource.getRepository(StaffAvailability);

  // Seed cities
  console.log('Seeding cities...');
  for (const c of CITIES) {
    const exists = await cityRepo.findOne({ where: { code: c.code } });
    if (!exists) await cityRepo.save(cityRepo.create(c));
  }

  // Seed departments
  console.log('Seeding departments...');
  const deptData = [
    { name: 'Teknik Destek', description: 'Teknik sorunlar ve arızalar' },
    { name: 'Fatura ve Ödeme', description: 'Fatura sorunları ve ödemeler' },
    {
      name: 'Kurulum ve Montaj',
      description: 'Yeni kurulum ve montaj işlemleri',
    },
    { name: 'Genel Şikayetler', description: 'Genel müşteri şikayetleri' },
    { name: 'Hukuki İşlemler', description: 'Hukuki süreçler ve başvurular' },
  ];

  const departments: Department[] = [];
  for (const d of deptData) {
    let dept = await deptRepo.findOne({ where: { name: d.name } });
    if (!dept) dept = await deptRepo.save(deptRepo.create(d));
    departments.push(dept);
  }

  // Seed categories
  console.log('Seeding categories...');
  const catData = [
    { name: 'İnternet Arızası', departmentId: departments[0].id },
    { name: 'TV Yayın Sorunu', departmentId: departments[0].id },
    { name: 'Telefon Arızası', departmentId: departments[0].id },
    { name: 'Fazla Fatura', departmentId: departments[1].id },
    { name: 'Ödeme Sorunu', departmentId: departments[1].id },
    { name: 'Yeni Hat Kurulum', departmentId: departments[2].id },
    { name: 'Cihaz Kurulumu', departmentId: departments[2].id },
    { name: 'Hizmet Memnuniyeti', departmentId: departments[3].id },
    { name: 'Abonelik İptali', departmentId: departments[3].id },
    { name: 'Sözleşme Uyuşmazlığı', departmentId: departments[4].id },
  ];

  for (const c of catData) {
    const exists = await catRepo.findOne({
      where: { name: c.name, departmentId: c.departmentId },
    });
    if (!exists) await catRepo.save(catRepo.create(c));
  }

  // Seed admin user
  console.log('Seeding admin user...');
  const adminExists = await userRepo.findOne({
    where: { email: 'admin@crm.com' },
  });
  if (!adminExists) {
    const admin = userRepo.create({
      email: 'admin@crm.com',
      password: 'Admin123!',
      name: 'Sistem',
      surname: 'Yöneticisi',
      role: UserRole.ADMIN,
    });
    await userRepo.save(admin);
    console.log('Admin created: admin@crm.com / Admin123!');
  }

  // Seed sample staff for İstanbul + Teknik Destek
  console.log('Seeding sample staff...');
  const istanbul = await cityRepo.findOne({ where: { code: '34' } });
  const teknikDept = departments[0];

  const staffData = [
    { name: 'Ahmet', surname: 'Yılmaz', email: 'ahmet@crm.com' },
    { name: 'Fatma', surname: 'Kaya', email: 'fatma@crm.com' },
    { name: 'Mehmet', surname: 'Demir', email: 'mehmet@crm.com' },
  ];

  for (const s of staffData) {
    const exists = await userRepo.findOne({ where: { email: s.email } });
    if (!exists) {
      const staff = userRepo.create({
        ...s,
        password: 'Staff123!',
        role: UserRole.STAFF,
        departmentId: teknikDept.id,
        cityId: istanbul?.id,
      });
      const saved = await userRepo.save(staff);
      await availRepo.save(availRepo.create({ staffId: saved.id }));
      console.log(`Staff created: ${s.email} / Staff123!`);
    }
  }

  // Sample customer
  const customerExists = await userRepo.findOne({
    where: { email: 'musteri@crm.com' },
  });
  if (!customerExists) {
    const customer = userRepo.create({
      email: 'musteri@crm.com',
      password: 'Musteri123!',
      name: 'Ali',
      surname: 'Müşteri',
      role: UserRole.CUSTOMER,
      cityId: istanbul?.id,
    });
    await userRepo.save(customer);
    console.log('Customer created: musteri@crm.com / Musteri123!');
  }

  // Seed resolution processes (one per category, applies to all cities)
  console.log('Seeding resolution processes...');
  const processRepo = dataSource.getRepository(ResolutionProcess);
  const stepRepo = dataSource.getRepository(ResolutionProcessStep);
  const allCategories = await catRepo.find();

  for (const category of allCategories) {
    const template = RESOLUTION_PROCESSES[category.name];
    if (!template) continue;

    const exists = await processRepo.findOne({
      where: { categoryId: category.id, appliesToAllCities: true },
    });
    if (exists) continue;

    const process = await processRepo.save(
      processRepo.create({
        name: template.name,
        categoryId: category.id,
        appliesToAllCities: true,
        cities: [],
        isActive: true,
      }),
    );

    const stepEntities = template.steps.map((s, idx) =>
      stepRepo.create({
        processId: process.id,
        order: idx + 1,
        title: s.title,
        description: s.description,
      }),
    );
    await stepRepo.save(stepEntities);
    console.log(`  Process created: ${template.name}`);
  }

  console.log('Seed completed!');
}
