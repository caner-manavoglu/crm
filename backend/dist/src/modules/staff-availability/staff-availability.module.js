"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffAvailabilityModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const staff_availability_controller_1 = require("./staff-availability.controller");
const staff_availability_service_1 = require("./staff-availability.service");
const staff_availability_entity_1 = require("./entities/staff-availability.entity");
const user_entity_1 = require("../users/entities/user.entity");
let StaffAvailabilityModule = class StaffAvailabilityModule {
};
exports.StaffAvailabilityModule = StaffAvailabilityModule;
exports.StaffAvailabilityModule = StaffAvailabilityModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([staff_availability_entity_1.StaffAvailability, user_entity_1.User])],
        controllers: [staff_availability_controller_1.StaffAvailabilityController],
        providers: [staff_availability_service_1.StaffAvailabilityService],
        exports: [staff_availability_service_1.StaffAvailabilityService, typeorm_1.TypeOrmModule],
    })
], StaffAvailabilityModule);
//# sourceMappingURL=staff-availability.module.js.map