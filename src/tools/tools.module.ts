// src\tools\tools.module.ts
import { Module } from '@nestjs/common';
import { ToolsController } from './tools.controller';

import { XmlParserService } from './services/xml-parser.service';
import { SalaryReceiptExtractorService } from './services/salary-receipt-extractor.service';
import { ReportGeneratorService } from './services/report-generator.service';
import { ExcelReportService } from './services/excel-report.service';
import { PdfReportService } from './services/pdf-report.service';

@Module({
  controllers: [ToolsController],
  providers: [
    XmlParserService,
    SalaryReceiptExtractorService,
    ReportGeneratorService,
    ExcelReportService,
    PdfReportService,
  ],
  exports: [
    XmlParserService,
    SalaryReceiptExtractorService,
    ReportGeneratorService,
  ],
})
export class ToolsModule {}
