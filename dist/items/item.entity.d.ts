import { PeriodPackageItem } from '../periods/period-package-item.entity';
import { Unit } from '../units/unit.entity';
export declare class Item {
    id: string;
    name: string;
    unit: Unit | null;
    isActive: boolean;
    periodItems: PeriodPackageItem[];
    createdAt: Date;
    updatedAt: Date;
}
