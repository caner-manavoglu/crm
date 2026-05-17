"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ComplaintsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const complaint_entity_1 = require("./entities/complaint.entity");
const complaint_history_entity_1 = require("./entities/complaint-history.entity");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const user_entity_1 = require("../users/entities/user.entity");
let ComplaintsService = class ComplaintsService {
    static { ComplaintsService_1 = this; }
    complaintRepo;
    historyRepo;
    userRepo;
    static GUEST_EMAIL = 'guest.portal@crm.local';
    constructor(complaintRepo, historyRepo, userRepo) {
        this.complaintRepo = complaintRepo;
        this.historyRepo = historyRepo;
        this.userRepo = userRepo;
    }
    async create(dto, customerId) {
        const resolvedCustomerId = customerId ?? (await this.getOrCreateGuestCustomerId());
        const complaint = this.complaintRepo.create({
            title: dto.title,
            content: dto.content,
            categoryId: dto.categoryId,
            cityId: dto.cityId,
            priority: dto.priority,
            customerId: resolvedCustomerId,
        });
        const saved = await this.complaintRepo.save(complaint);
        await this.historyRepo.save(this.historyRepo.create({
            complaintId: saved.id,
            userId: customerId,
            newStatus: saved.status,
            notes: customerId ? 'Şikayet oluşturuldu.' : 'Portal üzerinden şikayet oluşturuldu.',
        }));
        return saved;
    }
    async findAll(query) {
        return this.buildPaginatedQuery(query);
    }
    async findByCustomer(customerId, query) {
        return this.buildPaginatedQuery(query, { customerId });
    }
    async findOne(id) {
        const complaint = await this.complaintRepo.findOne({
            where: { id },
            relations: ['category', 'city'],
        });
        if (!complaint)
            throw new common_1.NotFoundException('Şikayet bulunamadı.');
        return complaint;
    }
    async updateStatus(id, dto, userId, userRole) {
        const complaint = await this.findOne(id);
        if (userRole === user_role_enum_1.UserRole.CUSTOMER && complaint.customerId !== userId) {
            throw new common_1.ForbiddenException();
        }
        const oldStatus = complaint.status;
        await this.complaintRepo.update(id, { status: dto.status });
        await this.historyRepo.save(this.historyRepo.create({
            complaintId: id,
            userId,
            oldStatus,
            newStatus: dto.status,
            notes: dto.notes,
        }));
        return this.findOne(id);
    }
    getHistory(id) {
        return this.historyRepo.find({
            where: { complaintId: id },
            relations: ['user'],
            order: { createdAt: 'ASC' },
        });
    }
    async buildPaginatedQuery(query, extraWhere = {}) {
        const { page = 1, limit = 20, status, cityId, priority, fromDate, toDate } = query;
        const qb = this.complaintRepo
            .createQueryBuilder('c')
            .leftJoinAndSelect('c.category', 'cat')
            .leftJoinAndSelect('c.city', 'city')
            .leftJoinAndSelect('cat.department', 'dept');
        Object.entries(extraWhere).forEach(([key, value]) => {
            qb.andWhere(`c.${key} = :${key}`, { [key]: value });
        });
        if (status)
            qb.andWhere('c.status = :status', { status });
        if (cityId)
            qb.andWhere('c.city_id = :cityId', { cityId });
        if (priority)
            qb.andWhere('c.priority = :priority', { priority });
        if (fromDate)
            qb.andWhere('c.created_at >= :fromDate', { fromDate });
        if (toDate)
            qb.andWhere('c.created_at <= :toDate', { toDate });
        if (query.departmentId) {
            qb.andWhere('cat.department_id = :departmentId', { departmentId: query.departmentId });
        }
        qb.orderBy('c.created_at', 'DESC').skip((page - 1) * limit).take(limit);
        const [data, total] = await qb.getManyAndCount();
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async getOrCreateGuestCustomerId() {
        const existing = await this.userRepo.findOne({
            where: { email: ComplaintsService_1.GUEST_EMAIL },
        });
        if (existing)
            return existing.id;
        const guest = this.userRepo.create({
            email: ComplaintsService_1.GUEST_EMAIL,
            password: (0, crypto_1.randomUUID)(),
            name: 'Portal',
            surname: 'Misafir',
            role: user_role_enum_1.UserRole.CUSTOMER,
            isActive: true,
        });
        const saved = await this.userRepo.save(guest);
        return saved.id;
    }
};
exports.ComplaintsService = ComplaintsService;
exports.ComplaintsService = ComplaintsService = ComplaintsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(complaint_entity_1.Complaint)),
    __param(1, (0, typeorm_1.InjectRepository)(complaint_history_entity_1.ComplaintHistory)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ComplaintsService);
//# sourceMappingURL=complaints.service.js.map