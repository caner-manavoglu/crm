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
exports.StaffAvailabilityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const staff_availability_service_1 = require("./staff-availability.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let StaffAvailabilityController = class StaffAvailabilityController {
    service;
    constructor(service) {
        this.service = service;
    }
    getAvailableStaff(departmentId, cityId) {
        return this.service.getAvailableStaff(departmentId, cityId);
    }
    toggleAvailability(user) {
        return this.service.toggleAvailability(user.id);
    }
    getMyAvailability(user) {
        return this.service.findByStaffId(user.id);
    }
};
exports.StaffAvailabilityController = StaffAvailabilityController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('departmentId')),
    __param(1, (0, common_1.Query)('cityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StaffAvailabilityController.prototype, "getAvailableStaff", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)('toggle'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], StaffAvailabilityController.prototype, "toggleAvailability", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], StaffAvailabilityController.prototype, "getMyAvailability", null);
exports.StaffAvailabilityController = StaffAvailabilityController = __decorate([
    (0, swagger_1.ApiTags)('Staff Availability'),
    (0, common_1.Controller)('staff-availability'),
    __metadata("design:paramtypes", [staff_availability_service_1.StaffAvailabilityService])
], StaffAvailabilityController);
//# sourceMappingURL=staff-availability.controller.js.map