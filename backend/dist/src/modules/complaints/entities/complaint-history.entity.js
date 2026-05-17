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
exports.ComplaintHistory = void 0;
const typeorm_1 = require("typeorm");
const complaint_status_enum_1 = require("../../../common/enums/complaint-status.enum");
const user_entity_1 = require("../../users/entities/user.entity");
let ComplaintHistory = class ComplaintHistory {
    id;
    complaint;
    complaintId;
    user;
    userId;
    oldStatus;
    newStatus;
    notes;
    createdAt;
};
exports.ComplaintHistory = ComplaintHistory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ComplaintHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)('Complaint', 'history', { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'complaint_id' }),
    __metadata("design:type", Object)
], ComplaintHistory.prototype, "complaint", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'complaint_id' }),
    __metadata("design:type", String)
], ComplaintHistory.prototype, "complaintId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], ComplaintHistory.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', nullable: true }),
    __metadata("design:type", String)
], ComplaintHistory.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: complaint_status_enum_1.ComplaintStatus, nullable: true, name: 'old_status' }),
    __metadata("design:type", String)
], ComplaintHistory.prototype, "oldStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: complaint_status_enum_1.ComplaintStatus, name: 'new_status' }),
    __metadata("design:type", String)
], ComplaintHistory.prototype, "newStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ComplaintHistory.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ComplaintHistory.prototype, "createdAt", void 0);
exports.ComplaintHistory = ComplaintHistory = __decorate([
    (0, typeorm_1.Entity)('complaint_history')
], ComplaintHistory);
//# sourceMappingURL=complaint-history.entity.js.map