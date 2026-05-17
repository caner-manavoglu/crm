import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Complaint } from '../complaints/entities/complaint.entity';
import { Assignment } from '../assignments/entities/assignment.entity';
import { StaffAvailability } from '../staff-availability/entities/staff-availability.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Complaint, Assignment, StaffAvailability])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
