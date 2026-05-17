import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { StaffAvailability } from '../staff-availability/entities/staff-availability.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, StaffAvailability])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
