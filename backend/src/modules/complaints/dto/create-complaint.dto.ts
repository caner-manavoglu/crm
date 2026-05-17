import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { ComplaintPriority } from '../../../common/enums/complaint-priority.enum';

export class CreateComplaintDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  content: string;

  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty()
  @IsUUID()
  cityId: string;

  @ApiPropertyOptional({ enum: ComplaintPriority })
  @IsEnum(ComplaintPriority)
  @IsOptional()
  priority?: ComplaintPriority;

  @ApiProperty()
  @IsBoolean()
  autoAssign: boolean;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  preferredStaffId?: string;
}
