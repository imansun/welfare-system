import { Item } from '../items/item.entity';
import { DistributionPeriod } from './distribution-period.entity';
export declare class PeriodPackageItem {
    id: string;
    period: DistributionPeriod;
    item: Item;
    quantity: string;
    note: string | null;
    createdAt: Date;
    updatedAt: Date;
}
