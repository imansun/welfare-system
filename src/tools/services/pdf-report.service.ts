// src/tools/services/pdf-report.service.ts
import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');

import { ExtractedEmployeeData } from '../interfaces/extracted-employee-data.interface';

@Injectable()
export class PdfReportService {
  async generate(
    employees: ExtractedEmployeeData[],
    fields: string[] = [],
  ): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 40,
        size: 'A4',
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      doc.on('error', (error) => {
        reject(error);
      });

      doc.fontSize(16).text('گزارش فیش حقوقی', {
        align: 'center',
      });

      doc.moveDown();

      for (const employee of employees) {
        doc.fontSize(13).text('-----------------------------');

        doc.fontSize(13).text(`کارمند: ${employee.fullName || ''}`);

        doc.moveDown(0.5);

        for (const field of fields) {
          const title = this.getFieldTitle(field);
          const value = this.resolveField(employee, field);

          doc.fontSize(10).text(`${title}: ${value}`);
        }

        doc.moveDown();
      }

      doc.end();
    });
  }

  private resolveField(employee: ExtractedEmployeeData, field: string): string {
    const value = employee[field as keyof ExtractedEmployeeData];

    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (this.isLoanItem(item)) {
            return `${item.loanName}: ${item.installmentAmount || ''}`;
          }

          if (this.isTitleValueItem(item)) {
            return `${item.title}: ${item.value || ''}`;
          }

          return JSON.stringify(item);
        })
        .join(' | ');
    }

    if (value === null || value === undefined) {
      return '';
    }

    return String(value);
  }

  private isLoanItem(
    item: unknown,
  ): item is { loanName?: string; installmentAmount?: string } {
    return (
      typeof item === 'object' &&
      item !== null &&
      'loanName' in item
    );
  }

  private isTitleValueItem(
    item: unknown,
  ): item is { title?: string; value?: string } {
    return (
      typeof item === 'object' &&
      item !== null &&
      'title' in item
    );
  }

  private getFieldTitle(field: string): string {
    const titles: Record<string, string> = {
      companyName: 'نام شرکت',
      year: 'سال',
      monthTitle: 'ماه',
      receiptType: 'نوع فیش',

      fullName: 'نام و نام خانوادگی',
      personnelCode: 'کد پرسنلی',
      organizationUnit: 'واحد سازمانی',
      jobTitle: 'عنوان شغلی',
      periodTitle: 'بازه زمانی',

      loans: 'وام‌ها',
      deductions: 'کسورات',
      payments: 'مزایا',
      attendance: 'حضور و غیاب',

      totalLoanInstallments: 'جمع اقساط وام',
      totalBenefits: 'جمع مزایا',
      totalDeductions: 'جمع کسورات',

      accountNumber: 'شماره حساب',
      netPayment: 'خالص پرداختی',
    };

    return titles[field] || field;
  }
}
