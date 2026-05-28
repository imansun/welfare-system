import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Item } from '../items/item.entity';
import { DistributionPeriod } from './distribution-period.entity';

@Entity('period_package_items')
@Unique(['period', 'item'])
export class PeriodPackageItem {
  @ApiProperty({ description: 'Unique identifier for the period package item' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    type: () => DistributionPeriod,
    description: 'The distribution period this package item belongs to',
  })
  @ManyToOne(() => DistributionPeriod, (period) => period.packageItems, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  period: DistributionPeriod;

  @ApiProperty({
    type: () => Item,
    description: 'The item in this package',
  })
  @ManyToOne(() => Item, (item) => item.periodItems, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  item: Item;

  @ApiProperty({
    description: 'Quantity of the item (positive number with up to 3 decimal places)',
    example: '10.5',
  })
  @Column('decimal', { precision: 18, scale: 3 })
  quantity: string;

  @ApiProperty({
    description: 'Unit price of the item in Rials (positive integer, no decimals)',
    example: '150000',
  })
  @Column('decimal', { precision: 18, scale: 0 })
  price: string;

  @ApiPropertyOptional({
    description: 'Optional note for this package item',
    nullable: true,
    example: 'Special packaging required',
  })
  @Column({ type: 'text', nullable: true })
  note: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}
