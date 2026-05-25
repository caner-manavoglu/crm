import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

// Süreç adımı girdisi. Sıra (order) dizideki konumdan belirlenir.
export class ResolutionStepInput {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}
