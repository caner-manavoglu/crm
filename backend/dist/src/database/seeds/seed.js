"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSeed = runSeed;
const city_entity_1 = require("../../modules/cities/entities/city.entity");
const department_entity_1 = require("../../modules/departments/entities/department.entity");
const category_entity_1 = require("../../modules/categories/entities/category.entity");
const user_entity_1 = require("../../modules/users/entities/user.entity");
const staff_availability_entity_1 = require("../../modules/staff-availability/entities/staff-availability.entity");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const CITIES = [
    { name: 'Adana', code: '01' }, { name: 'Adıyaman', code: '02' }, { name: 'Afyonkarahisar', code: '03' },
    { name: 'Ağrı', code: '04' }, { name: 'Amasya', code: '05' }, { name: 'Ankara', code: '06' },
    { name: 'Antalya', code: '07' }, { name: 'Artvin', code: '08' }, { name: 'Aydın', code: '09' },
    { name: 'Balıkesir', code: '10' }, { name: 'Bilecik', code: '11' }, { name: 'Bingöl', code: '12' },
    { name: 'Bitlis', code: '13' }, { name: 'Bolu', code: '14' }, { name: 'Burdur', code: '15' },
    { name: 'Bursa', code: '16' }, { name: 'Çanakkale', code: '17' }, { name: 'Çankırı', code: '18' },
    { name: 'Çorum', code: '19' }, { name: 'Denizli', code: '20' }, { name: 'Diyarbakır', code: '21' },
    { name: 'Edirne', code: '22' }, { name: 'Elazığ', code: '23' }, { name: 'Erzincan', code: '24' },
    { name: 'Erzurum', code: '25' }, { name: 'Eskişehir', code: '26' }, { name: 'Gaziantep', code: '27' },
    { name: 'Giresun', code: '28' }, { name: 'Gümüşhane', code: '29' }, { name: 'Hakkari', code: '30' },
    { name: 'Hatay', code: '31' }, { name: 'Isparta', code: '32' }, { name: 'Mersin', code: '33' },
    { name: 'İstanbul', code: '34' }, { name: 'İzmir', code: '35' }, { name: 'Kars', code: '36' },
    { name: 'Kastamonu', code: '37' }, { name: 'Kayseri', code: '38' }, { name: 'Kırklareli', code: '39' },
    { name: 'Kırşehir', code: '40' }, { name: 'Kocaeli', code: '41' }, { name: 'Konya', code: '42' },
    { name: 'Kütahya', code: '43' }, { name: 'Malatya', code: '44' }, { name: 'Manisa', code: '45' },
    { name: 'Kahramanmaraş', code: '46' }, { name: 'Mardin', code: '47' }, { name: 'Muğla', code: '48' },
    { name: 'Muş', code: '49' }, { name: 'Nevşehir', code: '50' }, { name: 'Niğde', code: '51' },
    { name: 'Ordu', code: '52' }, { name: 'Rize', code: '53' }, { name: 'Sakarya', code: '54' },
    { name: 'Samsun', code: '55' }, { name: 'Siirt', code: '56' }, { name: 'Sinop', code: '57' },
    { name: 'Sivas', code: '58' }, { name: 'Tekirdağ', code: '59' }, { name: 'Tokat', code: '60' },
    { name: 'Trabzon', code: '61' }, { name: 'Tunceli', code: '62' }, { name: 'Şanlıurfa', code: '63' },
    { name: 'Uşak', code: '64' }, { name: 'Van', code: '65' }, { name: 'Yozgat', code: '66' },
    { name: 'Zonguldak', code: '67' }, { name: 'Aksaray', code: '68' }, { name: 'Bayburt', code: '69' },
    { name: 'Karaman', code: '70' }, { name: 'Kırıkkale', code: '71' }, { name: 'Batman', code: '72' },
    { name: 'Şırnak', code: '73' }, { name: 'Bartın', code: '74' }, { name: 'Ardahan', code: '75' },
    { name: 'Iğdır', code: '76' }, { name: 'Yalova', code: '77' }, { name: 'Karabük', code: '78' },
    { name: 'Kilis', code: '79' }, { name: 'Osmaniye', code: '80' }, { name: 'Düzce', code: '81' },
];
async function runSeed(dataSource) {
    const cityRepo = dataSource.getRepository(city_entity_1.City);
    const deptRepo = dataSource.getRepository(department_entity_1.Department);
    const catRepo = dataSource.getRepository(category_entity_1.Category);
    const userRepo = dataSource.getRepository(user_entity_1.User);
    const availRepo = dataSource.getRepository(staff_availability_entity_1.StaffAvailability);
    console.log('Seeding cities...');
    for (const c of CITIES) {
        const exists = await cityRepo.findOne({ where: { code: c.code } });
        if (!exists)
            await cityRepo.save(cityRepo.create(c));
    }
    console.log('Seeding departments...');
    const deptData = [
        { name: 'Teknik Destek', description: 'Teknik sorunlar ve arızalar' },
        { name: 'Fatura ve Ödeme', description: 'Fatura sorunları ve ödemeler' },
        { name: 'Kurulum ve Montaj', description: 'Yeni kurulum ve montaj işlemleri' },
        { name: 'Genel Şikayetler', description: 'Genel müşteri şikayetleri' },
        { name: 'Hukuki İşlemler', description: 'Hukuki süreçler ve başvurular' },
    ];
    const departments = [];
    for (const d of deptData) {
        let dept = await deptRepo.findOne({ where: { name: d.name } });
        if (!dept)
            dept = await deptRepo.save(deptRepo.create(d));
        departments.push(dept);
    }
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
        const exists = await catRepo.findOne({ where: { name: c.name, departmentId: c.departmentId } });
        if (!exists)
            await catRepo.save(catRepo.create(c));
    }
    console.log('Seeding admin user...');
    const adminExists = await userRepo.findOne({ where: { email: 'admin@crm.com' } });
    if (!adminExists) {
        const admin = userRepo.create({
            email: 'admin@crm.com',
            password: 'Admin123!',
            name: 'Sistem',
            surname: 'Yöneticisi',
            role: user_role_enum_1.UserRole.ADMIN,
        });
        await userRepo.save(admin);
        console.log('Admin created: admin@crm.com / Admin123!');
    }
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
                role: user_role_enum_1.UserRole.STAFF,
                departmentId: teknikDept.id,
                cityId: istanbul?.id,
            });
            const saved = await userRepo.save(staff);
            await availRepo.save(availRepo.create({ staffId: saved.id }));
            console.log(`Staff created: ${s.email} / Staff123!`);
        }
    }
    const customerExists = await userRepo.findOne({ where: { email: 'musteri@crm.com' } });
    if (!customerExists) {
        const customer = userRepo.create({
            email: 'musteri@crm.com',
            password: 'Musteri123!',
            name: 'Ali',
            surname: 'Müşteri',
            role: user_role_enum_1.UserRole.CUSTOMER,
            cityId: istanbul?.id,
        });
        await userRepo.save(customer);
        console.log('Customer created: musteri@crm.com / Musteri123!');
    }
    console.log('Seed completed!');
}
//# sourceMappingURL=seed.js.map