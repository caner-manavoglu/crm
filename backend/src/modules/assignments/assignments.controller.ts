import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { TransferAssignmentDto } from './dto/transfer-assignment.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

@ApiTags('Assignments')
@ApiBearerAuth()
@Controller('assignments')
export class AssignmentsController {
  constructor(private assignmentsService: AssignmentsService) {}

  @Roles(UserRole.STAFF)
  @Get('my')
  getMyAssignments(@CurrentUser() user: User) {
    return this.assignmentsService.getMyAssignments(user.id);
  }

  @Roles(UserRole.ADMIN)
  @Post('admin-assign')
  adminAssign(@Body() dto: CreateAssignmentDto, @CurrentUser() user: User) {
    return this.assignmentsService.adminAssign(
      dto.complaintId,
      dto.staffId,
      user.id,
    );
  }

  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @Patch(':id/transfer')
  transfer(
    @Param('id') id: string,
    @Body() dto: TransferAssignmentDto,
    @CurrentUser() user: User,
  ) {
    return this.assignmentsService.transferAssignment(id, dto, user.id);
  }

  @Get('complaint/:complaintId')
  findByComplaint(@Param('complaintId') complaintId: string) {
    return this.assignmentsService.findByComplaintId(complaintId);
  }
}
