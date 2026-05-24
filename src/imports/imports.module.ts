import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../companies/company.entity';
import { Employee } from '../employees/employee.entity';
import { DistributionPeriod } from '../periods/distribution-period.entity';
import { PeriodRecipient } from '../periods/period-recipient.entity';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DistributionPeriod,
      Employee,
      Company,
      PeriodRecipient,
    ]),
  ],
  controllers: [ImportsController],
  providers: [ImportsService],
})
export class ImportsModule {}
