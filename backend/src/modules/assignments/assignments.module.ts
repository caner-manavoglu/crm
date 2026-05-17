import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { Assignment } from './entities/assignment.entity';
import { Complaint } from '../complaints/entities/complaint.entity';
import { ComplaintHistory } from '../complaints/entities/complaint-history.entity';
import { StaffAvailability } from '../staff-availability/entities/staff-availability.entity';
import { Category } from '../categories/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Assignment,
      Complaint,
      ComplaintHistory,
      StaffAvailability,
      Category,
    ]),
  ],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
