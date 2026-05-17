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
var SchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const assignments_service_1 = require("../assignments/assignments.service");
const staff_availability_entity_1 = require("../staff-availability/entities/staff-availability.entity");
const staff_availability_service_1 = require("../staff-availability/staff-availability.service");
let SchedulerService = SchedulerService_1 = class SchedulerService {
    assignmentsService;
    availabilityService;
    availRepo;
    logger = new common_1.Logger(SchedulerService_1.name);
    constructor(assignmentsService, availabilityService, availRepo) {
        this.assignmentsService = assignmentsService;
        this.availabilityService = availabilityService;
        this.availRepo = availRepo;
    }
    async handlePoolAssignment() {
        this.logger.log('Pool assignment cron started');
        const result = await this.assignmentsService.processPool();
        this.logger.log(`Pool cron: ${result.assigned} atandı, ${result.stillPending} bekliyor`);
    }
    async handleDailySync() {
        this.logger.log('Daily staff load sync started');
        const allStaff = await this.availRepo.find();
        for (const s of allStaff) {
            await this.availabilityService.syncFromDatabase(s.staffId);
        }
        this.logger.log(`Synced ${allStaff.length} staff records`);
    }
};
exports.SchedulerService = SchedulerService;
__decorate([
    (0, schedule_1.Cron)('*/5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handlePoolAssignment", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handleDailySync", null);
exports.SchedulerService = SchedulerService = SchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(staff_availability_entity_1.StaffAvailability)),
    __metadata("design:paramtypes", [assignments_service_1.AssignmentsService,
        staff_availability_service_1.StaffAvailabilityService,
        typeorm_2.Repository])
], SchedulerService);
//# sourceMappingURL=scheduler.service.js.map