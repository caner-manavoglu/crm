import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

// Public kayıt yalnızca müşteri hesabı oluşturur. Rol/departman gibi yetki
// alanları kabul edilmez; personel/admin yalnızca admin korumalı POST /users ile açılır.
export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  surname: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  cityId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;
}
