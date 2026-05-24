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
import { Employee } from '../employees/employee.entity';
import { DistributionPeriod } from './distribution-period.entity';
import { PeriodRecipientStatus } from './period-recipient-status.enum';

@Entity('period_recipients')
@Unique(['period', 'employee'])
export class PeriodRecipient {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: () => DistributionPeriod })
  @ManyToOne(() => DistributionPeriod, (period) => period.recipients, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  period: DistributionPeriod;

  @ApiProperty({ type: () => Employee })
  @ManyToOne(() => Employee, (employee) => employee.recipients, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  employee: Employee;

  @ApiProperty({ enum: PeriodRecipientStatus })
  @Column({
    type: 'enum',
    enum: PeriodRecipientStatus,
    default: PeriodRecipientStatus.ACTIVE,
  })
  status: PeriodRecipientStatus;

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
