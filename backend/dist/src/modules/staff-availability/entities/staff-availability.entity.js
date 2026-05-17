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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffAvailability = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
let StaffAvailability = class StaffAvailability {
    id;
    staff;
    staffId;
    currentLoad;
    maxCapacity;
    isAvailable;
    lastUpdated;
};
exports.StaffAvailability = StaffAvailability;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StaffAvailability.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'staff_id' }),
    __metadata("design:type", user_entity_1.User)
], StaffAvailability.prototype, "staff", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'staff_id', unique: true }),
    __metadata("design:type", String)
], StaffAvailability.prototype, "staffId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_load', default: 0 }),
    __metadata("design:type", Number)
], StaffAvailability.prototype, "currentLoad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_capacity', default: 4 }),
    __metadata("design:type", Number)
], StaffAvailability.prototype, "maxCapacity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_available', default: true }),
    __metadata("design:type", Boolean)
], StaffAvailability.prototype, "isAvailable", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'last_updated' }),
    __metadata("design:type", Date)
], StaffAvailability.prototype, "lastUpdated", void 0);
exports.StaffAvailability = StaffAvailability = __decorate([
    (0, typeorm_1.Entity)('staff_availability')
], StaffAvailability);
//# sourceMappingURL=staff-availability.entity.js.map