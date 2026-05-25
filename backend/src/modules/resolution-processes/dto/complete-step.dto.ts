import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class CompleteStepDto {
  @ApiProperty()
  @IsBoolean()
  isCompleted: boolean;
}
