// src\imports\dto\import-recipients-result.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ImportRecipientsResultDto {
  @ApiProperty({ description: 'شناسه دوره توزیع' })
  periodId: string;

  @ApiProperty({ description: 'تعداد رکوردهای با موفقیت وارد شده' })
  imported: number;

  @ApiProperty({ description: 'تعداد رکوردهای رد شده (به دلیل خطا یا تکراری بودن)' })
  skipped: number;

  @ApiProperty({ 
    type: [String],
    description: 'لیست خطاهای رخ داده در حین ایمپورت (شامل شماره سطر و دلیل خطا)',
  })
  errors: string[];
}
