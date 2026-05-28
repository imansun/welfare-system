import { ExtractedEmployeeData } from '../interfaces/extracted-employee-data.interface';
export declare class PdfReportService {
    generate(employees: ExtractedEmployeeData[], fields?: string[]): Promise<Buffer>;
    private resolveField;
    private isLoanItem;
    private isTitleValueItem;
    private getFieldTitle;
}
