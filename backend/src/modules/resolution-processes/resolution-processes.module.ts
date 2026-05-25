import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResolutionProcessesController } from './resolution-processes.controller';
import { ResolutionProcessesService } from './resolution-processes.service';
import { ResolutionProcess } from './entities/resolution-process.entity';
import { ResolutionProcessStep } from './entities/resolution-process-step.entity';
import { ComplaintResolutionStep } from './entities/complaint-resolution-step.entity';
import { City } from '../cities/entities/city.entity';
import { Category } from '../categories/entities/category.entity';
import { Complaint } from '../complaints/entities/complaint.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ResolutionProcess,
      ResolutionProcessStep,
      ComplaintResolutionStep,
      City,
      Category,
      Complaint,
    ]),
  ],
  controllers: [ResolutionProcessesController],
  providers: [ResolutionProcessesService],
  exports: [ResolutionProcessesService],
})
export class ResolutionProcessesModule {}
