import { Repository } from 'typeorm';
import { Item } from '../items/item.entity';
import { CreatePeriodPackageItemDto } from './dto/create-period-package-item.dto';
import { UpdatePeriodPackageItemDto } from './dto/update-period-package-item.dto';
import { DistributionPeriod } from './distribution-period.entity';
import { PeriodPackageItem } from './period-package-item.entity';
export declare class PeriodPackageItemsService {
    private readonly packageItemsRepository;
    private readonly periodsRepository;
    private readonly itemsRepository;
    constructor(packageItemsRepository: Repository<PeriodPackageItem>, periodsRepository: Repository<DistributionPeriod>, itemsRepository: Repository<Item>);
    create(periodId: string, createDto: CreatePeriodPackageItemDto): Promise<PeriodPackageItem>;
    findAll(periodId: string): Promise<PeriodPackageItem[]>;
    findOne(periodId: string, packageItemId: string): Promise<PeriodPackageItem>;
    update(periodId: string, packageItemId: string, updateDto: UpdatePeriodPackageItemDto): Promise<PeriodPackageItem>;
    remove(periodId: string, packageItemId: string): Promise<void>;
    private getWritablePeriod;
    private getItem;
}
