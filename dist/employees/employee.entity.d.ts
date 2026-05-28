import { Company } from '../companies/company.entity';
import { Invoice } from '../invoices/invoice.entity';
import { PeriodRecipient } from '../periods/period-recipient.entity';
export declare class Employee {
    id: string;
    personnelCode: string;
    fullName: string;
    company: Company | null;
    isActive: boolean;
    recipients: PeriodRecipient[];
    invoices: Invoice[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}
