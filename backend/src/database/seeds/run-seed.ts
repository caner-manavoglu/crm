import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { runSeed } from './seed';
import { City } from '../../modules/cities/entities/city.entity';
import { Department } from '../../modules/departments/entities/department.entity';
import { Category } from '../../modules/categories/entities/category.entity';
import { User } from '../../modules/users/entities/user.entity';
import { StaffAvailability } from '../../modules/staff-availability/entities/staff-availability.entity';
import { Complaint } from '../../modules/complaints/entities/complaint.entity';
import { ComplaintHistory } from '../../modules/complaints/entities/complaint-history.entity';
import { Assignment } from '../../modules/assignments/entities/assignment.entity';
import { ResolutionProcess } from '../../modules/resolution-processes/entities/resolution-process.entity';
import { ResolutionProcessStep } from '../../modules/resolution-processes/entities/resolution-process-step.entity';
import { ComplaintResolutionStep } from '../../modules/resolution-processes/entities/complaint-resolution-step.entity';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'crm_db',
  username: process.env.DB_USER || 'crm_user',
  password: process.env.DB_PASSWORD || 'crm_password',
  entities: [
    City,
    Department,
    Category,
    User,
    StaffAvailability,
    Complaint,
    ComplaintHistory,
    Assignment,
    ResolutionProcess,
    ResolutionProcessStep,
    ComplaintResolutionStep,
  ],
  synchronize: true,
});

dataSource
  .initialize()
  .then(() => runSeed(dataSource))
  .then(() => dataSource.destroy())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
