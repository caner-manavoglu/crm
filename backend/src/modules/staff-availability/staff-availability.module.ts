import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffAvailabilityController } from './staff-availability.controller';
import { StaffAvailabilityService } from './staff-availability.service';
import { StaffAvailability } from './entities/staff-availability.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StaffAvailability, User])],
  controllers: [StaffAvailabilityController],
  providers: [StaffAvailabilityService],
  exports: [StaffAvailabilityService, TypeOrmModule],
})
export class StaffAvailabilityModule {}
