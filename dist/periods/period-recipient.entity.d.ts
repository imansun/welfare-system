import { Employee } from '../employees/employee.entity';
import { DistributionPeriod } from './distribution-period.entity';
import { PeriodRecipientStatus } from './period-recipient-status.enum';
export declare class PeriodRecipient {
    id: string;
    period: DistributionPeriod;
    employee: Employee;
    status: PeriodRecipientStatus;
    note: string | null;
    createdAt: Date;
    updatedAt: Date;
}
