import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

@ApiTags('Ratings')
@ApiBearerAuth()
@Controller()
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @Roles(UserRole.CUSTOMER)
  @Post('complaints/:id/rate')
  rate(
    @Param('id') id: string,
    @Body() dto: CreateRatingDto,
    @CurrentUser() user: User,
  ) {
    return this.ratingsService.create(id, dto, user);
  }

  @Get('complaints/:id/rating')
  findOne(@Param('id') id: string) {
    return this.ratingsService.findByComplaint(id);
  }

  @Roles(UserRole.ADMIN)
  @Get('ratings/stats')
  stats() {
    return this.ratingsService.stats();
  }
}
