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
import { Company } from '../companies/company.entity';
import { Invoice } from '../invoices/invoice.entity';
import { PeriodRecipient } from '../periods/period-recipient.entity';

@Entity('employees')
export class Employee {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: true })
  personnelCode: string;

  @ApiProperty()
  @Column()
  fullName: string;

  @ApiPropertyOptional({ type: () => Company, nullable: true })
  @ManyToOne(() => Company, (company) => company.employees, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  company: Company | null;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => PeriodRecipient, (recipient) => recipient.employee)
  recipients: PeriodRecipient[];

  @OneToMany(() => Invoice, (invoice) => invoice.employee)
  invoices: Invoice[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
