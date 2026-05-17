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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const staff_availability_entity_1 = require("../staff-availability/entities/staff-availability.entity");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
let UsersService = class UsersService {
    userRepo;
    availabilityRepo;
    constructor(userRepo, availabilityRepo) {
        this.userRepo = userRepo;
        this.availabilityRepo = availabilityRepo;
    }
    async create(dto) {
        const existing = await this.userRepo.findOne({ where: { email: dto.email } });
        if (existing)
            throw new common_1.ConflictException('Bu e-posta zaten kullanılıyor.');
        const user = this.userRepo.create(dto);
        await this.userRepo.save(user);
        if (user.role === user_role_enum_1.UserRole.STAFF) {
            const availability = this.availabilityRepo.create({ staffId: user.id });
            await this.availabilityRepo.save(availability);
        }
        return user;
    }
    findAll(role) {
        const where = role ? { role, isActive: true } : {};
        return this.userRepo.find({
            where,
            relations: ['department', 'city'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const user = await this.userRepo.findOne({
            where: { id },
            relations: ['department', 'city'],
        });
        if (!user)
            throw new common_1.NotFoundException('Kullanıcı bulunamadı.');
        return user;
    }
    async update(id, dto) {
        await this.findOne(id);
        await this.userRepo.update(id, dto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        await this.userRepo.update(id, { isActive: false });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(staff_availability_entity_1.StaffAvailability)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map