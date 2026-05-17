import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Analytics')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboard() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('status-breakdown')
  getStatusBreakdown() {
    return this.analyticsService.getComplaintsByStatus();
  }

  @Get('department-breakdown')
  getDepartmentBreakdown() {
    return this.analyticsService.getComplaintsByDepartment();
  }

  @Get('trend')
  getTrend(@Query('days') days?: string) {
    return this.analyticsService.getResolutionTrend(days ? parseInt(days) : 30);
  }

  @Get('staff-performance')
  getStaffPerformance() {
    return this.analyticsService.getStaffPerformance();
  }
}
