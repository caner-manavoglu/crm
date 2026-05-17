import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class TransferAssignmentDto {
  @ApiProperty()
  @IsUUID()
  toStaffId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reason?: string;
}
