// src\tools\services\report-generator.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { ExtractedEmployeeData } from '../interfaces/extracted-employee-data.interface';
import { ReportFormat } from '../interfaces/report-format.type';
import { ExcelReportService } from './excel-report.service';
import { PdfReportService } from './pdf-report.service';

@Injectable()
export class ReportGeneratorService {
  constructor(
    private readonly excelReportService: ExcelReportService,
    private readonly pdfReportService: PdfReportService,
  ) {}

  async generate(
    employees: ExtractedEmployeeData[],
    format: ReportFormat,
    fields?: string[],
  ): Promise<Buffer> {
    const selectedFields = fields?.length ? fields : this.getDefaultFields();

    if (format === 'excel') {
      return this.excelReportService.generate(employees, selectedFields);
    }

    if (format === 'pdf') {
      return this.pdfReportService.generate(employees, selectedFields);
    }

    throw new BadRequestException('فرمت خروجی پشتیبانی نمی‌شود.');
  }

  private getDefaultFields(): string[] {
    return [
      'companyName',
      'year',
      'monthTitle',
      'receiptType',
      'fullName',
      'personnelCode',
      'organizationUnit',
      'jobTitle',
      'periodTitle',
      'totalLoanInstallments',
      'totalBenefits',
      'totalDeductions',
      'accountNumber',
      'netPayment',
    ];
  }
}
