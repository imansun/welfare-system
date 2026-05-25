import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistributionPeriod } from '../periods/distribution-period.entity';
import { PeriodPackageItem } from '../periods/period-package-item.entity';
import { PeriodRecipient } from '../periods/period-recipient.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Invoice } from './invoice.entity';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      InvoiceItem,
      DistributionPeriod,
      PeriodRecipient,
      PeriodPackageItem,
    ]),
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
