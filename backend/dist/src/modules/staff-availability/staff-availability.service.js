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
exports.StaffAvailabilityService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const staff_availability_entity_1 = require("./entities/staff-availability.entity");
const user_entity_1 = require("../users/entities/user.entity");
let StaffAvailabilityService = class StaffAvailabilityService {
    availRepo;
    userRepo;
    constructor(availRepo, userRepo) {
        this.availRepo = availRepo;
        this.userRepo = userRepo;
    }
    async getAvailableStaff(departmentId, cityId) {
        return this.availRepo
            .createQueryBuilder('sa')
            .innerJoinAndSelect('sa.staff', 'u')
            .where('u.department_id = :departmentId', { departmentId })
            .andWhere('u.city_id = :cityId', { cityId })
            .andWhere('u.is_active = true')
            .andWhere('sa.is_available = true')
            .andWhere('sa.current_load < sa.max_capacity')
            .orderBy('sa.current_load', 'ASC')
            .getMany();
    }
    async findByStaffId(staffId) {
        const avail = await this.availRepo.findOne({ where: { staffId } });
        if (!avail)
            throw new common_1.NotFoundException('Personel müsaitlik kaydı bulunamadı.');
        return avail;
    }
    async incrementLoad(staffId) {
        await this.availRepo.increment({ staffId }, 'currentLoad', 1);
    }
    async decrementLoad(staffId) {
        await this.availRepo
            .createQueryBuilder()
            .update(staff_availability_entity_1.StaffAvailability)
            .set({ currentLoad: () => 'GREATEST(current_load - 1, 0)' })
            .where('staff_id = :staffId', { staffId })
            .execute();
    }
    async toggleAvailability(staffId) {
        const avail = await this.findByStaffId(staffId);
        avail.isAvailable = !avail.isAvailable;
        return this.availRepo.save(avail);
    }
    async syncFromDatabase(staffId) {
        const count = await this.userRepo.manager
            .createQueryBuilder()
            .select('COUNT(a.id)', 'cnt')
            .from('assignments', 'a')
            .where('a.staff_id = :staffId', { staffId })
            .andWhere('a.is_active = true')
            .getRawOne();
        await this.availRepo.update({ staffId }, { currentLoad: parseInt(count?.cnt || '0', 10) });
    }
};
exports.StaffAvailabilityService = StaffAvailabilityService;
exports.StaffAvailabilityService = StaffAvailabilityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(staff_availability_entity_1.StaffAvailability)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], StaffAvailabilityService);
//# sourceMappingURL=staff-availability.service.js.map