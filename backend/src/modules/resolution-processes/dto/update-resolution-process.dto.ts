import { PartialType } from '@nestjs/swagger';
import { CreateResolutionProcessDto } from './create-resolution-process.dto';

// Tüm alanlar opsiyonel; `steps` verilirse mevcut adımlar tamamen değiştirilir.
export class UpdateResolutionProcessDto extends PartialType(
  CreateResolutionProcessDto,
) {}
