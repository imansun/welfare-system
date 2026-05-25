// src/tools/dto/generate-report.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { ReportFormat } from '../interfaces/report-format.enum';

export class GenerateReportDto {
  @ApiProperty({
    enum: ReportFormat,
    enumName: 'ReportFormat',
    example: ReportFormat.EXCEL,
    description: 'فرمت خروجی گزارش',
  })
  @IsEnum(ReportFormat)
  format: ReportFormat;

  @ApiPropertyOptional({
    type: [String],
    example: [
      'companyName',
      'year',
      'monthTitle',
      'fullName',
      'personnelCode',
      'organizationUnit',
      'netPayment',
    ],
    description:
      'فهرست فیلدهایی که باید در گزارش نهایی نمایش داده شوند. اگر ارسال نشود، سرویس می‌تواند فیلدهای پیش‌فرض را استفاده کند.',
  })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        return value.includes(',')
          ? value.split(',').map((item) => item.trim()).filter(Boolean)
          : [value];
      }
    }

    return undefined;
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fields?: string[];
}
