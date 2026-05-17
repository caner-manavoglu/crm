import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssignmentsService } from '../assignments/assignments.service';
import { StaffAvailability } from '../staff-availability/entities/staff-availability.entity';
import { StaffAvailabilityService } from '../staff-availability/staff-availability.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private assignmentsService: AssignmentsService,
    private availabilityService: StaffAvailabilityService,
    @InjectRepository(StaffAvailability) private availRepo: Repository<StaffAvailability>,
  ) {}

  @Cron('*/5 * * * *')
  async handlePoolAssignment() {
    this.logger.log('Pool assignment cron started');
    const result = await this.assignmentsService.processPool();
    this.logger.log(`Pool cron: ${result.assigned} atandı, ${result.stillPending} bekliyor`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailySync() {
    this.logger.log('Daily staff load sync started');
    const allStaff = await this.availRepo.find();
    for (const s of allStaff) {
      await this.availabilityService.syncFromDatabase(s.staffId);
    }
    this.logger.log(`Synced ${allStaff.length} staff records`);
  }
}
