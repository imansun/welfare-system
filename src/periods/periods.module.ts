import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from '../items/item.entity';
import { User } from '../users/user.entity';
import { DistributionPeriod } from './distribution-period.entity';
import { PeriodPackageItem } from './period-package-item.entity';
import { PeriodPackageItemsService } from './period-package-items.service';
import { PeriodsController } from './periods.controller';
import { PeriodsService } from './periods.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DistributionPeriod, User, PeriodPackageItem, Item]),
  ],
  controllers: [PeriodsController],
  providers: [PeriodsService, PeriodPackageItemsService],
  exports: [PeriodsService, PeriodPackageItemsService],
})
export class PeriodsModule {}
