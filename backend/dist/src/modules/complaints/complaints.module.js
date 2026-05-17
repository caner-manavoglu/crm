"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const complaints_controller_1 = require("./complaints.controller");
const complaints_service_1 = require("./complaints.service");
const complaint_entity_1 = require("./entities/complaint.entity");
const complaint_history_entity_1 = require("./entities/complaint-history.entity");
const assignments_module_1 = require("../assignments/assignments.module");
const user_entity_1 = require("../users/entities/user.entity");
let ComplaintsModule = class ComplaintsModule {
};
exports.ComplaintsModule = ComplaintsModule;
exports.ComplaintsModule = ComplaintsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([complaint_entity_1.Complaint, complaint_history_entity_1.ComplaintHistory, user_entity_1.User]),
            assignments_module_1.AssignmentsModule,
        ],
        controllers: [complaints_controller_1.ComplaintsController],
        providers: [complaints_service_1.ComplaintsService],
        exports: [complaints_service_1.ComplaintsService, typeorm_1.TypeOrmModule],
    })
], ComplaintsModule);
//# sourceMappingURL=complaints.module.js.map