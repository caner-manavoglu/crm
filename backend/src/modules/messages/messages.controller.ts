import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Messages')
@ApiBearerAuth()
@Controller('complaints/:id/messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get()
  list(@Param('id') id: string, @CurrentUser() user: User) {
    return this.messagesService.list(id, user);
  }

  @Post()
  create(
    @Param('id') id: string,
    @Body() dto: CreateMessageDto,
    @CurrentUser() user: User,
  ) {
    return this.messagesService.create(id, dto, user);
  }
}
