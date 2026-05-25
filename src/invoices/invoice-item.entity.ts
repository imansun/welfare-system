import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity('invoice_items')
export class InvoiceItem {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: () => Invoice })
  @ManyToOne(() => Invoice, (invoice) => invoice.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  invoice: Invoice;

  @ApiProperty()
  @Column()
  itemName: string;

  @ApiPropertyOptional({ nullable: true })
  @Column({ type: 'varchar', nullable: true })
  unitName: string | null;

  @ApiProperty()
  @Column('decimal', { precision: 18, scale: 3 })
  quantity: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
