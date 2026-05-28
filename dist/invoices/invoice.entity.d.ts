import { Employee } from '../employees/employee.entity';
import { DistributionPeriod } from '../periods/distribution-period.entity';
import { InvoiceItem } from './invoice-item.entity';
export declare class Invoice {
    id: string;
    period: DistributionPeriod;
    employee: Employee;
    invoiceNumber: string;
    issuedAt: Date;
    employeeName: string;
    personnelCode: string;
    companyName: string | null;
    periodTitle: string;
    periodCode: string;
    totalItems: number;
    items: InvoiceItem[];
    createdAt: Date;
    updatedAt: Date;
}
