import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulerService } from './scheduler.service';
import { AssignmentsModule } from '../assignments/assignments.module';
import { StaffAvailabilityModule } from '../staff-availability/staff-availability.module';
import { StaffAvailability } from '../staff-availability/entities/staff-availability.entity';

@Module({
  imports: [
    AssignmentsModule,
    StaffAvailabilityModule,
    TypeOrmModule.forFeature([StaffAvailability]),
  ],
  providers: [SchedulerService],
})
export class SchedulerModule {}
