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
exports.AssignmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const assignment_entity_1 = require("./entities/assignment.entity");
const complaint_entity_1 = require("../complaints/entities/complaint.entity");
const complaint_history_entity_1 = require("../complaints/entities/complaint-history.entity");
const staff_availability_entity_1 = require("../staff-availability/entities/staff-availability.entity");
const category_entity_1 = require("../categories/entities/category.entity");
const assignment_type_enum_1 = require("../../common/enums/assignment-type.enum");
const complaint_status_enum_1 = require("../../common/enums/complaint-status.enum");
let AssignmentsService = class AssignmentsService {
    assignmentRepo;
    complaintRepo;
    historyRepo;
    availRepo;
    categoryRepo;
    dataSource;
    constructor(assignmentRepo, complaintRepo, historyRepo, availRepo, categoryRepo, dataSource) {
        this.assignmentRepo = assignmentRepo;
        this.complaintRepo = complaintRepo;
        this.historyRepo = historyRepo;
        this.availRepo = availRepo;
        this.categoryRepo = categoryRepo;
        this.dataSource = dataSource;
    }
    async handleNewComplaint(complaint, dto) {
        const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
        if (!category)
            return null;
        if (!dto.autoAssign && dto.preferredStaffId) {
            return this.assignComplaint(complaint.id, dto.preferredStaffId, assignment_type_enum_1.AssignmentType.MANUAL, complaint.customerId);
        }
        if (dto.autoAssign) {
            const staff = await this.findMostAvailableStaff(category.departmentId, complaint.cityId);
            if (staff) {
                return this.assignComplaint(complaint.id, staff.staffId, assignment_type_enum_1.AssignmentType.AUTO, complaint.customerId);
            }
        }
        return null;
    }
    async findMostAvailableStaff(departmentId, cityId) {
        return this.availRepo
            .createQueryBuilder('sa')
            .innerJoin('sa.staff', 'u')
            .where('u.department_id = :departmentId', { departmentId })
            .andWhere('u.city_id = :cityId', { cityId })
            .andWhere('u.is_active = true')
            .andWhere('sa.is_available = true')
            .andWhere('sa.current_load < sa.max_capacity')
            .orderBy('sa.current_load', 'ASC')
            .getOne();
    }
    async assignComplaint(complaintId, staffId, type, assignedById) {
        return this.dataSource.transaction(async (manager) => {
            const avail = await manager
                .createQueryBuilder(staff_availability_entity_1.StaffAvailability, 'sa')
                .setLock('pessimistic_write')
                .where('sa.staff_id = :staffId', { staffId })
                .getOne();
            if (!avail || !avail.isAvailable || avail.currentLoad >= avail.maxCapacity) {
                throw new common_1.BadRequestException('Personel şu anda müsait değil.');
            }
            avail.currentLoad += 1;
            await manager.save(avail);
            const assignment = manager.create(assignment_entity_1.Assignment, {
                complaintId,
                staffId,
                assignedById,
                assignmentType: type,
            });
            const saved = await manager.save(assignment);
            await manager.update(complaint_entity_1.Complaint, complaintId, { status: complaint_status_enum_1.ComplaintStatus.ASSIGNED });
            const complaint = await manager.findOne(complaint_entity_1.Complaint, { where: { id: complaintId } });
            await manager.save(manager.create(complaint_history_entity_1.ComplaintHistory, {
                complaintId,
                userId: assignedById,
                oldStatus: complaint_status_enum_1.ComplaintStatus.PENDING,
                newStatus: complaint_status_enum_1.ComplaintStatus.ASSIGNED,
                notes: type === assignment_type_enum_1.AssignmentType.AUTO ? 'Otomatik atandı.' : 'Manuel atandı.',
            }));
            return saved;
        });
    }
    async transferAssignment(assignmentId, dto, requesterId) {
        return this.dataSource.transaction(async (manager) => {
            const assignment = await manager.findOne(assignment_entity_1.Assignment, {
                where: { id: assignmentId, isActive: true },
            });
            if (!assignment)
                throw new common_1.NotFoundException('Atama bulunamadı.');
            const oldStaffId = assignment.staffId;
            const newAvail = await manager
                .createQueryBuilder(staff_availability_entity_1.StaffAvailability, 'sa')
                .setLock('pessimistic_write')
                .where('sa.staff_id = :staffId', { staffId: dto.toStaffId })
                .getOne();
            if (!newAvail || !newAvail.isAvailable || newAvail.currentLoad >= newAvail.maxCapacity) {
                throw new common_1.BadRequestException('Hedef personel müsait değil.');
            }
            assignment.staffId = dto.toStaffId;
            assignment.assignmentType = assignment_type_enum_1.AssignmentType.TRANSFER;
            assignment.assignedById = requesterId;
            assignment.notes = dto.reason ?? null;
            await manager.save(assignment);
            newAvail.currentLoad += 1;
            await manager.save(newAvail);
            await manager
                .createQueryBuilder()
                .update(staff_availability_entity_1.StaffAvailability)
                .set({ currentLoad: () => 'GREATEST(current_load - 1, 0)' })
                .where('staff_id = :staffId', { staffId: oldStaffId })
                .execute();
            const complaint = await manager.findOne(complaint_entity_1.Complaint, { where: { id: assignment.complaintId } });
            await manager.save(manager.create(complaint_history_entity_1.ComplaintHistory, {
                complaintId: assignment.complaintId,
                userId: requesterId,
                oldStatus: complaint?.status,
                newStatus: complaint?.status,
                notes: `Transfer: ${dto.reason || 'Yeni personele aktarıldı.'}`,
            }));
            return assignment;
        });
    }
    async getMyAssignments(staffId) {
        return this.assignmentRepo.find({
            where: { staffId, isActive: true },
            relations: ['complaint', 'complaint.category', 'complaint.city', 'complaint.customer'],
            order: { assignedAt: 'DESC' },
        });
    }
    async findByComplaintId(complaintId) {
        return this.assignmentRepo.findOne({
            where: { complaintId, isActive: true },
            relations: ['staff'],
        });
    }
    async processPool() {
        const pendingComplaints = await this.complaintRepo.find({
            where: { status: complaint_status_enum_1.ComplaintStatus.PENDING },
            relations: ['category'],
            order: { createdAt: 'ASC' },
        });
        let assigned = 0;
        for (const complaint of pendingComplaints) {
            if (!complaint.category?.departmentId || !complaint.cityId)
                continue;
            const staff = await this.findMostAvailableStaff(complaint.category.departmentId, complaint.cityId);
            if (staff) {
                try {
                    await this.assignComplaint(complaint.id, staff.staffId, assignment_type_enum_1.AssignmentType.AUTO);
                    assigned++;
                }
                catch {
                }
            }
        }
        const stillPending = pendingComplaints.length - assigned;
        return { assigned, stillPending };
    }
    async adminAssign(complaintId, staffId, adminId) {
        return this.assignComplaint(complaintId, staffId, assignment_type_enum_1.AssignmentType.MANUAL, adminId);
    }
};
exports.AssignmentsService = AssignmentsService;
exports.AssignmentsService = AssignmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(assignment_entity_1.Assignment)),
    __param(1, (0, typeorm_1.InjectRepository)(complaint_entity_1.Complaint)),
    __param(2, (0, typeorm_1.InjectRepository)(complaint_history_entity_1.ComplaintHistory)),
    __param(3, (0, typeorm_1.InjectRepository)(staff_availability_entity_1.StaffAvailability)),
    __param(4, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], AssignmentsService);
//# sourceMappingURL=assignments.service.js.map