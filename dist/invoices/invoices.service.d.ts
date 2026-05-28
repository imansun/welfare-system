import { Repository } from 'typeorm';
import { DistributionPeriod } from '../periods/distribution-period.entity';
import { PeriodPackageItem } from '../periods/period-package-item.entity';
import { PeriodRecipient } from '../periods/period-recipient.entity';
import { GenerateInvoicesResultDto } from './dto/generate-invoices-result.dto';
import { InvoiceItem } from './invoice-item.entity';
import { Invoice } from './invoice.entity';
export declare class InvoicesService {
    private readonly invoicesRepository;
    private readonly invoiceItemsRepository;
    private readonly periodsRepository;
    private readonly recipientsRepository;
    private readonly packageItemsRepository;
    constructor(invoicesRepository: Repository<Invoice>, invoiceItemsRepository: Repository<InvoiceItem>, periodsRepository: Repository<DistributionPeriod>, recipientsRepository: Repository<PeriodRecipient>, packageItemsRepository: Repository<PeriodPackageItem>);
    findAll(): Promise<Invoice[]>;
    findOne(id: string): Promise<Invoice>;
    findByPeriod(periodId: string): Promise<Invoice[]>;
    generateForPeriod(periodId: string): Promise<GenerateInvoicesResultDto>;
    private createInvoice;
    private getInvoiceablePeriod;
    private getPackageItems;
    private getActiveRecipients;
    private createInvoiceNumber;
}
