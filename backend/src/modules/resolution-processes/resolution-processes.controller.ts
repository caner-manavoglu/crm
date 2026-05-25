import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResolutionProcessesService } from './resolution-processes.service';
import { CreateResolutionProcessDto } from './dto/create-resolution-process.dto';
import { UpdateResolutionProcessDto } from './dto/update-resolution-process.dto';
import { CreateComplaintProcessDto } from './dto/create-complaint-process.dto';
import { CompleteStepDto } from './dto/complete-step.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

@ApiTags('Resolution Processes')
@ApiBearerAuth()
@Controller('resolution-processes')
export class ResolutionProcessesController {
  constructor(private service: ResolutionProcessesService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateResolutionProcessDto) {
    return this.service.create(dto);
  }

  // Talep detayından anlık süreç tanımlama (yalnızca o kategori + şehir).
  @Roles(UserRole.ADMIN)
  @Post('complaint/:complaintId')
  createForComplaint(
    @Param('complaintId') complaintId: string,
    @Body() dto: CreateComplaintProcessDto,
  ) {
    return this.service.createForComplaint(complaintId, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get('applicable')
  findApplicable(
    @Query('categoryId') categoryId: string,
    @Query('cityId') cityId: string,
  ) {
    return this.service.findApplicable(categoryId, cityId);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get('complaint/:complaintId/steps')
  getComplaintSteps(@Param('complaintId') complaintId: string) {
    return this.service.getOrInitComplaintSteps(complaintId);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get()
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('cityId') cityId?: string,
  ) {
    return this.service.findAll(categoryId, cityId);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Patch('complaint/:complaintId/steps/:stepId')
  completeStep(
    @Param('complaintId') complaintId: string,
    @Param('stepId') stepId: string,
    @Body() dto: CompleteStepDto,
    @CurrentUser() user: User,
  ) {
    return this.service.completeStep(complaintId, stepId, dto.isCompleted, user.id);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateResolutionProcessDto) {
    return this.service.update(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
