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
import { Invoice } from '../invoices/invoice.entity';
import { User } from '../users/user.entity';
import { DistributionPeriodStatus } from './distribution-period-status.enum';
import { PeriodPackageItem } from './period-package-item.entity';
import { PeriodRecipient } from './period-recipient.entity';

@Entity('distribution_periods')
export class DistributionPeriod {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: true })
  code: string;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column()
  year: number;

  @ApiProperty()
  @Column()
  month: number;

  @ApiProperty({ enum: DistributionPeriodStatus })
  @Column({
    type: 'enum',
    enum: DistributionPeriodStatus,
    default: DistributionPeriodStatus.DRAFT,
  })
  status: DistributionPeriodStatus;

  @ApiPropertyOptional({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  archivedAt: Date | null;

  @ApiPropertyOptional({ type: () => User, nullable: true })
  @ManyToOne(() => User, (user) => user.createdPeriods, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  createdBy: User | null;

  @OneToMany(() => PeriodRecipient, (recipient) => recipient.period)
  recipients: PeriodRecipient[];

  @OneToMany(() => PeriodPackageItem, (packageItem) => packageItem.period)
  packageItems: PeriodPackageItem[];

  @OneToMany(() => Invoice, (invoice) => invoice.period)
  invoices: Invoice[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
