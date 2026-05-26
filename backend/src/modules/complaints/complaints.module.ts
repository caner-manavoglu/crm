import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintsController } from './complaints.controller';
import { ComplaintsService } from './complaints.service';
import { Complaint } from './entities/complaint.entity';
import { ComplaintHistory } from './entities/complaint-history.entity';
import { AssignmentsModule } from '../assignments/assignments.module';
import { User } from '../users/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { ResolutionProcessesModule } from '../resolution-processes/resolution-processes.module';
import { RatingsModule } from '../ratings/ratings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Complaint, ComplaintHistory, User]),
    AssignmentsModule,
    NotificationsModule,
    ResolutionProcessesModule,
    RatingsModule,
  ],
  controllers: [ComplaintsController],
  providers: [ComplaintsService],
  exports: [ComplaintsService, TypeOrmModule],
})
export class ComplaintsModule {}
