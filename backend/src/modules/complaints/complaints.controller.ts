import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ComplaintsService } from './complaints.service';
import { AssignmentsService } from '../assignments/assignments.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { ComplaintQueryDto } from './dto/complaint-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

@ApiTags('Complaints')
@ApiBearerAuth()
@Controller('complaints')
export class ComplaintsController {
  constructor(
    private complaintsService: ComplaintsService,
    private assignmentsService: AssignmentsService,
  ) {}

  @Public()
  @Post()
  async create(@Body() dto: CreateComplaintDto, @CurrentUser() user?: User) {
    const complaint = await this.complaintsService.create(dto, user?.id);
    await this.assignmentsService.handleNewComplaint(complaint, dto);
    return complaint;
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get()
  findAll(@Query() query: ComplaintQueryDto) {
    return this.complaintsService.findAll(query);
  }

  @Roles(UserRole.CUSTOMER)
  @Get('my')
  findMine(@CurrentUser() user: User, @Query() query: ComplaintQueryDto) {
    return this.complaintsService.findByCustomer(user.id, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.complaintsService.findOneForUser(id, user);
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string, @CurrentUser() user: User) {
    return this.complaintsService.getHistoryForUser(id, user);
  }

  @Roles(UserRole.CUSTOMER, UserRole.STAFF, UserRole.ADMIN)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateComplaintStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.complaintsService.updateStatus(id, dto, user);
  }
}
