import { Controller, Get, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StaffAvailabilityService } from './staff-availability.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Staff Availability')
@Controller('staff-availability')
export class StaffAvailabilityController {
  constructor(private service: StaffAvailabilityService) {}

  @Public()
  @Get()
  getAvailableStaff(
    @Query('departmentId') departmentId: string,
    @Query('cityId') cityId: string,
  ) {
    return this.service.getAvailableStaff(departmentId, cityId);
  }

  @ApiBearerAuth()
  @Patch('toggle')
  toggleAvailability(@CurrentUser() user: User) {
    return this.service.toggleAvailability(user.id);
  }

  @ApiBearerAuth()
  @Get('me')
  getMyAvailability(@CurrentUser() user: User) {
    return this.service.findByStaffId(user.id);
  }
}
