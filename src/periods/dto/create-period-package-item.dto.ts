import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePeriodPackageItemDto {
  @ApiProperty()
  @IsUUID()
  itemId: string;

  @ApiProperty()
  @IsNumberString()
  quantity: string;
  
  @ApiProperty()
  @IsNumberString()
  price: string;

  @ApiProperty()
  @IsNumberString()
  price: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
