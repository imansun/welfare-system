import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PeriodPackageItem } from '../periods/period-package-item.entity';
import { Unit } from '../units/unit.entity';

@Entity('items')
export class Item {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: true })
  name: string;

  @ApiPropertyOptional({ type: () => Unit, nullable: true })
  @ManyToOne(() => Unit, (unit) => unit.items, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  unit: Unit | null;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => PeriodPackageItem, (periodItem) => periodItem.item)
  periodItems: PeriodPackageItem[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
