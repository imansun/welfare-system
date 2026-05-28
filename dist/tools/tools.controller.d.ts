import type { Response } from 'express';
import { GenerateReportDto } from './dto/generate-report.dto';
import { ReportGeneratorService } from './services/report-generator.service';
import { SalaryReceiptExtractorService } from './services/salary-receipt-extractor.service';
import { XmlParserService } from './services/xml-parser.service';
export declare class ToolsController {
    private readonly xmlParserService;
    private readonly extractorService;
    private readonly reportGeneratorService;
    private readonly logger;
    constructor(xmlParserService: XmlParserService, extractorService: SalaryReceiptExtractorService, reportGeneratorService: ReportGeneratorService);
    parseXml(file: Express.Multer.File, body: {
        personnelCode?: string;
        firstName?: string;
        lastName?: string;
        fullName?: string;
        search?: string;
    }): Promise<{
        count: number;
        data: import("./interfaces/extracted-employee-data.interface").ExtractedEmployeeData[];
    }>;
    generateReport(file: Express.Multer.File, dto: GenerateReportDto, res: Response): Promise<Response<any, Record<string, any>>>;
    private filterEmployees;
    private normalizeSearchValue;
}
