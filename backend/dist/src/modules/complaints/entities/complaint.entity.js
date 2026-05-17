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
exports.Complaint = void 0;
const typeorm_1 = require("typeorm");
const complaint_status_enum_1 = require("../../../common/enums/complaint-status.enum");
const complaint_priority_enum_1 = require("../../../common/enums/complaint-priority.enum");
const user_entity_1 = require("../../users/entities/user.entity");
const category_entity_1 = require("../../categories/entities/category.entity");
const city_entity_1 = require("../../cities/entities/city.entity");
const complaint_history_entity_1 = require("./complaint-history.entity");
let Complaint = class Complaint {
    id;
    title;
    content;
    status;
    priority;
    customer;
    customerId;
    category;
    categoryId;
    city;
    cityId;
    history;
    createdAt;
    updatedAt;
};
exports.Complaint = Complaint;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Complaint.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Complaint.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Complaint.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: complaint_status_enum_1.ComplaintStatus, default: complaint_status_enum_1.ComplaintStatus.PENDING }),
    __metadata("design:type", String)
], Complaint.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: complaint_priority_enum_1.ComplaintPriority, default: complaint_priority_enum_1.ComplaintPriority.MEDIUM }),
    __metadata("design:type", String)
], Complaint.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", user_entity_1.User)
], Complaint.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id' }),
    __metadata("design:type", String)
], Complaint.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => category_entity_1.Category, { eager: true, onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'category_id' }),
    __metadata("design:type", category_entity_1.Category)
], Complaint.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category_id', nullable: true }),
    __metadata("design:type", String)
], Complaint.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => city_entity_1.City, { eager: true, onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'city_id' }),
    __metadata("design:type", city_entity_1.City)
], Complaint.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'city_id', nullable: true }),
    __metadata("design:type", String)
], Complaint.prototype, "cityId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => complaint_history_entity_1.ComplaintHistory, (h) => h.complaint, { cascade: true }),
    __metadata("design:type", Array)
], Complaint.prototype, "history", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Complaint.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Complaint.prototype, "updatedAt", void 0);
exports.Complaint = Complaint = __decorate([
    (0, typeorm_1.Entity)('complaints')
], Complaint);
//# sourceMappingURL=complaint.entity.js.map