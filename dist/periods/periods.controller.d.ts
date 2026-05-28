import { CreatePeriodDto } from './dto/create-period.dto';
import { CreatePeriodPackageItemDto } from './dto/create-period-package-item.dto';
import { UpdatePeriodPackageItemDto } from './dto/update-period-package-item.dto';
import { UpdatePeriodDto } from './dto/update-period.dto';
import { DistributionPeriod } from './distribution-period.entity';
import { PeriodPackageItem } from './period-package-item.entity';
import { PeriodPackageItemsService } from './period-package-items.service';
import { PeriodsService } from './periods.service';
export declare class PeriodsController {
    private readonly periodsService;
    private readonly packageItemsService;
    constructor(periodsService: PeriodsService, packageItemsService: PeriodPackageItemsService);
    create(createPeriodDto: CreatePeriodDto): Promise<DistributionPeriod>;
    findAll(): Promise<DistributionPeriod[]>;
    findOne(id: string): Promise<DistributionPeriod>;
    update(id: string, updatePeriodDto: UpdatePeriodDto): Promise<DistributionPeriod>;
    archive(id: string): Promise<DistributionPeriod>;
    cancel(id: string): Promise<DistributionPeriod>;
    remove(id: string): Promise<void>;
    createPackageItem(periodId: string, createDto: CreatePeriodPackageItemDto): Promise<PeriodPackageItem>;
    findPackageItems(periodId: string): Promise<PeriodPackageItem[]>;
    findPackageItem(periodId: string, packageItemId: string): Promise<PeriodPackageItem>;
    updatePackageItem(periodId: string, packageItemId: string, updateDto: UpdatePeriodPackageItemDto): Promise<PeriodPackageItem>;
    removePackageItem(periodId: string, packageItemId: string): Promise<void>;
}
