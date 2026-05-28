import { Invoice } from './invoice.entity';
export declare class InvoiceItem {
    id: string;
    invoice: Invoice;
    itemName: string;
    unitName: string | null;
    quantity: string;
    createdAt: Date;
    updatedAt: Date;
}
