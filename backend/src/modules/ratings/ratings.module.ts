import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintRating } from './entities/complaint-rating.entity';
import { Complaint } from '../complaints/entities/complaint.entity';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ComplaintRating, Complaint]),
    NotificationsModule,
  ],
  providers: [RatingsService],
  controllers: [RatingsController],
  exports: [RatingsService],
})
export class RatingsModule {}
