"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv = __importStar(require("dotenv"));
const seed_1 = require("./seed");
const city_entity_1 = require("../../modules/cities/entities/city.entity");
const department_entity_1 = require("../../modules/departments/entities/department.entity");
const category_entity_1 = require("../../modules/categories/entities/category.entity");
const user_entity_1 = require("../../modules/users/entities/user.entity");
const staff_availability_entity_1 = require("../../modules/staff-availability/entities/staff-availability.entity");
const complaint_entity_1 = require("../../modules/complaints/entities/complaint.entity");
const complaint_history_entity_1 = require("../../modules/complaints/entities/complaint-history.entity");
const assignment_entity_1 = require("../../modules/assignments/entities/assignment.entity");
dotenv.config();
const dataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'crm_db',
    username: process.env.DB_USER || 'crm_user',
    password: process.env.DB_PASSWORD || 'crm_password',
    entities: [city_entity_1.City, department_entity_1.Department, category_entity_1.Category, user_entity_1.User, staff_availability_entity_1.StaffAvailability, complaint_entity_1.Complaint, complaint_history_entity_1.ComplaintHistory, assignment_entity_1.Assignment],
    synchronize: true,
});
dataSource
    .initialize()
    .then(() => (0, seed_1.runSeed)(dataSource))
    .then(() => dataSource.destroy())
    .catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=run-seed.js.map