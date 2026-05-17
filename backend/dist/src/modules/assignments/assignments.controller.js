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
exports.AssignmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const assignments_service_1 = require("./assignments.service");
const transfer_assignment_dto_1 = require("./dto/transfer-assignment.dto");
const create_assignment_dto_1 = require("./dto/create-assignment.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const user_entity_1 = require("../users/entities/user.entity");
let AssignmentsController = class AssignmentsController {
    assignmentsService;
    constructor(assignmentsService) {
        this.assignmentsService = assignmentsService;
    }
    getMyAssignments(user) {
        return this.assignmentsService.getMyAssignments(user.id);
    }
    adminAssign(dto, user) {
        return this.assignmentsService.adminAssign(dto.complaintId, dto.staffId, user.id);
    }
    transfer(id, dto, user) {
        return this.assignmentsService.transferAssignment(id, dto, user.id);
    }
    findByComplaint(complaintId) {
        return this.assignmentsService.findByComplaintId(complaintId);
    }
};
exports.AssignmentsController = AssignmentsController;
__decorate([
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STAFF),
    (0, common_1.Get)('my'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "getMyAssignments", null);
__decorate([
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, common_1.Post)('admin-assign'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_assignment_dto_1.CreateAssignmentDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "adminAssign", null);
__decorate([
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.STAFF, user_role_enum_1.UserRole.ADMIN),
    (0, common_1.Patch)(':id/transfer'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transfer_assignment_dto_1.TransferAssignmentDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "transfer", null);
__decorate([
    (0, common_1.Get)('complaint/:complaintId'),
    __param(0, (0, common_1.Param)('complaintId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "findByComplaint", null);
exports.AssignmentsController = AssignmentsController = __decorate([
    (0, swagger_1.ApiTags)('Assignments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('assignments'),
    __metadata("design:paramtypes", [assignments_service_1.AssignmentsService])
], AssignmentsController);
//# sourceMappingURL=assignments.controller.js.map