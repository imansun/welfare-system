import { GenerateInvoicesResultDto } from './dto/generate-invoices-result.dto';
import { Invoice } from './invoice.entity';
import { InvoicesService } from './invoices.service';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    findAll(): Promise<Invoice[]>;
    findByPeriod(periodId: string): Promise<Invoice[]>;
    findOne(id: string): Promise<Invoice>;
    generateForPeriod(periodId: string): Promise<GenerateInvoicesResultDto>;
}
