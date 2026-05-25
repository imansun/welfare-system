// src\tools\services\excel-report.service.ts
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { ExtractedEmployeeData } from '../interfaces/extracted-employee-data.interface';

@Injectable()
export class ExcelReportService {
  async generate(
    employees: ExtractedEmployeeData[],
    fields: string[],
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Salary Receipts');

    worksheet.views = [{ rightToLeft: true }];

    worksheet.columns = fields.map((field) => ({
      header: this.getFieldTitle(field),
      key: field,
      width: 25,
    }));

    for (const employee of employees) {
      worksheet.addRow(this.flattenEmployee(employee, fields));
    }

    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private flattenEmployee(employee: ExtractedEmployeeData, fields: string[]) {
    const row: Record<string, any> = {};

    for (const field of fields) {
      const value = this.resolveField(employee, field);
      row[field] = value;
    }

    return row;
  }

  private resolveField(employee: ExtractedEmployeeData, field: string): any {
    const value = (employee as any)[field];

    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (item.loanName) {
            return `${item.loanName}: ${item.installmentAmount || ''}`;
          }

          if (item.title) {
            return `${item.title}: ${item.value || ''}`;
          }

          return JSON.stringify(item);
        })
        .join(' | ');
    }

    return value ?? '';
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
