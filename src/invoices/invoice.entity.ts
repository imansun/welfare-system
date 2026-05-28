import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from '../employees/employee.entity';
import { DistributionPeriod } from '../periods/distribution-period.entity';
import { InvoiceItem } from './invoice-item.entity';

@Entity('invoices')
@Unique(['period', 'employee'])
export class Invoice {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: () => DistributionPeriod })
  @ManyToOne(() => DistributionPeriod, (period) => period.invoices, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  period: DistributionPeriod;

  @ApiProperty({ type: () => Employee })
  @ManyToOne(() => Employee, (employee) => employee.invoices, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  employee: Employee;

  @ApiProperty()
  @Column({ unique: true })
  invoiceNumber: string;

  @ApiProperty()
  @Column({ type: 'timestamp' })
  issuedAt: Date;

  @ApiProperty()
  @Column()
  employeeName: string;

  @ApiProperty()
  @Column()
  personnelCode: string;

  @ApiPropertyOptional({ nullable: true })
  @Column({ type: 'varchar', nullable: true })
  companyName: string | null;

  @ApiProperty()
  @Column()
  periodTitle: string;

  @ApiProperty()
  @Column()
  periodCode: string;

  @ApiProperty({ description: 'Total amount of the invoice in Rials' })
  @Column('decimal', { precision: 18, scale: 0, default: 0 })
  totalAmount: string;

  @ApiProperty()
  @Column()
  totalItems: number;

  @ApiProperty({ type: () => [InvoiceItem] })
  @OneToMany(() => InvoiceItem, (item) => item.invoice, {
    cascade: true,
  })
  items: InvoiceItem[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
