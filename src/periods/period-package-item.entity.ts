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
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: () => DistributionPeriod })
  @ManyToOne(() => DistributionPeriod, (period) => period.packageItems, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  period: DistributionPeriod;

  @ApiProperty({ type: () => Item })
  @ManyToOne(() => Item, (item) => item.periodItems, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  item: Item;

  @ApiProperty()
  @Column('decimal', { precision: 18, scale: 3 })
  quantity: string;

  @ApiPropertyOptional({ nullable: true })
  @Column({ type: 'text', nullable: true })
  note: string | null;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
