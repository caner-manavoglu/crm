import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ResolutionStepInput } from './resolution-step.input';

// Talep detayından anlık süreç tanımlama. Süreç, talebin kategorisi ve şehri
// için (yalnızca o şehir) oluşturulur ve adımlar talebe uygulanır.
export class CreateComplaintProcessDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ type: [ResolutionStepInput] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ResolutionStepInput)
  steps: ResolutionStepInput[];
}
