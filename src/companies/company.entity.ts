// src\companies\company.entity.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from '../employees/employee.entity';

@Entity('companies')
export class Company {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiPropertyOptional({ nullable: true })
  @Column({ type: 'varchar', unique: true, nullable: true })
  code: string | null;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Employee, (employee) => employee.company)
  employees: Employee[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
