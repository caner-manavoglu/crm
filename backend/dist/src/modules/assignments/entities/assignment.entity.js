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
exports.Assignment = void 0;
const typeorm_1 = require("typeorm");
const assignment_type_enum_1 = require("../../../common/enums/assignment-type.enum");
const complaint_entity_1 = require("../../complaints/entities/complaint.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let Assignment = class Assignment {
    id;
    complaint;
    complaintId;
    staff;
    staffId;
    assignedBy;
    assignedById;
    assignmentType;
    notes;
    isActive;
    assignedAt;
};
exports.Assignment = Assignment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Assignment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => complaint_entity_1.Complaint, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'complaint_id' }),
    __metadata("design:type", complaint_entity_1.Complaint)
], Assignment.prototype, "complaint", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'complaint_id', unique: true }),
    __metadata("design:type", String)
], Assignment.prototype, "complaintId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: false, onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'staff_id' }),
    __metadata("design:type", user_entity_1.User)
], Assignment.prototype, "staff", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'staff_id', nullable: true }),
    __metadata("design:type", String)
], Assignment.prototype, "staffId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_by_id' }),
    __metadata("design:type", user_entity_1.User)
], Assignment.prototype, "assignedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_by_id', nullable: true }),
    __metadata("design:type", String)
], Assignment.prototype, "assignedById", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: assignment_type_enum_1.AssignmentType, name: 'assignment_type' }),
    __metadata("design:type", String)
], Assignment.prototype, "assignmentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Assignment.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Assignment.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'assigned_at' }),
    __metadata("design:type", Date)
], Assignment.prototype, "assignedAt", void 0);
exports.Assignment = Assignment = __decorate([
    (0, typeorm_1.Entity)('assignments')
], Assignment);
//# sourceMappingURL=assignment.entity.js.map