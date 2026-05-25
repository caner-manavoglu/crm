import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ResolutionStepInput } from './resolution-step.input';

export class CreateResolutionProcessDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty()
  @IsBoolean()
  appliesToAllCities: boolean;

  // appliesToAllCities false ise en az bir şehir gerekir.
  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  cityIds?: string[];

  @ApiProperty({ type: [ResolutionStepInput] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ResolutionStepInput)
  steps: ResolutionStepInput[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
