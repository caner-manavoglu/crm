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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const complaint_entity_1 = require("../complaints/entities/complaint.entity");
const assignment_entity_1 = require("../assignments/entities/assignment.entity");
const staff_availability_entity_1 = require("../staff-availability/entities/staff-availability.entity");
const complaint_status_enum_1 = require("../../common/enums/complaint-status.enum");
let AnalyticsService = class AnalyticsService {
    complaintRepo;
    assignmentRepo;
    availRepo;
    constructor(complaintRepo, assignmentRepo, availRepo) {
        this.complaintRepo = complaintRepo;
        this.assignmentRepo = assignmentRepo;
        this.availRepo = availRepo;
    }
    async getDashboardStats() {
        const [total, pending, assigned, inProgress, resolved, closed] = await Promise.all([
            this.complaintRepo.count(),
            this.complaintRepo.count({ where: { status: complaint_status_enum_1.ComplaintStatus.PENDING } }),
            this.complaintRepo.count({ where: { status: complaint_status_enum_1.ComplaintStatus.ASSIGNED } }),
            this.complaintRepo.count({ where: { status: complaint_status_enum_1.ComplaintStatus.IN_PROGRESS } }),
            this.complaintRepo.count({ where: { status: complaint_status_enum_1.ComplaintStatus.RESOLVED } }),
            this.complaintRepo.count({ where: { status: complaint_status_enum_1.ComplaintStatus.CLOSED } }),
        ]);
        const totalStaff = await this.availRepo.count();
        const availableStaff = await this.availRepo.count({ where: { isAvailable: true } });
        return { total, pending, assigned, inProgress, resolved, closed, totalStaff, availableStaff };
    }
    async getComplaintsByStatus() {
        return this.complaintRepo
            .createQueryBuilder('c')
            .select('c.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('c.status')
            .getRawMany();
    }
    async getComplaintsByDepartment() {
        return this.complaintRepo
            .createQueryBuilder('c')
            .innerJoin('c.category', 'cat')
            .innerJoin('cat.department', 'dept')
            .select('dept.name', 'department')
            .addSelect('COUNT(*)', 'count')
            .groupBy('dept.name')
            .orderBy('count', 'DESC')
            .getRawMany();
    }
    async getResolutionTrend(days = 30) {
        const from = new Date();
        from.setDate(from.getDate() - days);
        return this.complaintRepo
            .createQueryBuilder('c')
            .select("DATE_TRUNC('day', c.created_at)", 'date')
            .addSelect('COUNT(*)', 'count')
            .where('c.created_at >= :from', { from })
            .groupBy("DATE_TRUNC('day', c.created_at)")
            .orderBy('date', 'ASC')
            .getRawMany();
    }
    async getStaffPerformance() {
        return this.assignmentRepo
            .createQueryBuilder('a')
            .innerJoin('a.staff', 'u')
            .select('u.name', 'name')
            .addSelect('u.surname', 'surname')
            .addSelect('COUNT(a.id)', 'totalAssigned')
            .groupBy('u.id')
            .orderBy('totalAssigned', 'DESC')
            .getRawMany();
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(complaint_entity_1.Complaint)),
    __param(1, (0, typeorm_1.InjectRepository)(assignment_entity_1.Assignment)),
    __param(2, (0, typeorm_1.InjectRepository)(staff_availability_entity_1.StaffAvailability)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map