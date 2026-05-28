import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreatePeriodPackageItemDto {
  @ApiProperty({ description: 'ID of the item to add to the period package' })
  @IsUUID()
  itemId: string;

  @ApiProperty({
    description: 'Quantity of the item (positive number with up to 3 decimal places)',
    example: '10.5',
  })
  @IsNumberString({}, { message: 'Quantity must be a positive number string' })
  quantity: string;

  @ApiProperty({
    description: 'Unit price of the item in Rials (positive integer)',
    example: '150000',
  })
  @IsNumberString({}, { message: 'Price must be a positive number string' })
  price: string;

  @ApiPropertyOptional({
    description: 'Optional note for this package item',
    example: 'Special packaging required',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
