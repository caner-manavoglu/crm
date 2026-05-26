import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { AttachmentsService, MAX_FILE_SIZE } from './attachments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Attachments')
@Controller()
export class AttachmentsController {
  constructor(private attachmentsService: AttachmentsService) {}

  @ApiBearerAuth()
  @Get('complaints/:id/attachments')
  list(@Param('id') id: string, @CurrentUser() user: User) {
    return this.attachmentsService.listForComplaint(id, user);
  }

  @ApiBearerAuth()
  @Post('complaints/:id/attachments')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE } }))
  upload(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.attachmentsService.uploadForComplaint(id, file, user);
  }

  @ApiBearerAuth()
  @Get('attachments/:id')
  async download(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const { attachment, absolutePath } =
      await this.attachmentsService.getForDownload(id, user);
    res.setHeader('Content-Type', attachment.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(attachment.originalName)}"`,
    );
    createReadStream(absolutePath).pipe(res);
  }

  @ApiBearerAuth()
  @Delete('attachments/:id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.attachmentsService.remove(id, user);
  }

  // --- Public track endpoints ---

  @Public()
  @Get('complaints/track/:code/attachments')
  trackList(@Param('code') code: string) {
    return this.attachmentsService.listForTracking(code);
  }

  @Throttle({ strict: { limit: 10, ttl: 60_000 } })
  @Public()
  @Post('complaints/track/:code/attachments')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE } }))
  trackUpload(
    @Param('code') code: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attachmentsService.uploadForTracking(code, file);
  }

  @Public()
  @Get('attachments/track/:code/:id')
  async trackDownload(
    @Param('code') code: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const { attachment, absolutePath } =
      await this.attachmentsService.getForTrackingDownload(code, id);
    res.setHeader('Content-Type', attachment.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(attachment.originalName)}"`,
    );
    createReadStream(absolutePath).pipe(res);
  }
}
