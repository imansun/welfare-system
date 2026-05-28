import { Invoice } from '../invoices/invoice.entity';
import { User } from '../users/user.entity';
import { DistributionPeriodStatus } from './distribution-period-status.enum';
import { PeriodPackageItem } from './period-package-item.entity';
import { PeriodRecipient } from './period-recipient.entity';
export declare class DistributionPeriod {
    id: string;
    code: string;
    title: string;
    year: number;
    month: number;
    status: DistributionPeriodStatus;
    description: string | null;
    archivedAt: Date | null;
    createdBy: User | null;
    recipients: PeriodRecipient[];
    packageItems: PeriodPackageItem[];
    invoices: Invoice[];
    createdAt: Date;
    updatedAt: Date;
}
