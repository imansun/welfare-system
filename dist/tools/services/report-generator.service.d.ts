import { ExtractedEmployeeData } from '../interfaces/extracted-employee-data.interface';
import { ReportFormat } from '../interfaces/report-format.type';
import { ExcelReportService } from './excel-report.service';
import { PdfReportService } from './pdf-report.service';
export declare class ReportGeneratorService {
    private readonly excelReportService;
    private readonly pdfReportService;
    constructor(excelReportService: ExcelReportService, pdfReportService: PdfReportService);
    generate(employees: ExtractedEmployeeData[], format: ReportFormat, fields?: string[]): Promise<Buffer>;
    private getDefaultFields;
}
