// src\imports\imports.controller.ts
import {
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { ImportRecipientsResultDto } from './dto/import-recipients-result.dto';
import { ImportsService } from './imports.service';

@ApiTags('imports')
@Controller('imports')
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post('periods/:periodId/recipients')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ 
    summary: 'Import period recipients from Excel',
    description: `این اندپوینت برای ایمپورت دریافت‌کنندگان یک دوره توزیع از فایل اکسل استفاده می‌شود.
    
## فیلدهای اجباری در اکسل:
- **personnelCode** (یا personnel_code): کد پرسنلی - اجباری
- **fullName** (یا full_name): نام و نام خانوادگی - اجباری

## فیلدهای اختیاری:
- **companyCode/companyName**: کد یا نام شرکت
- **status**: وضعیت (ACTIVE, INACTIVE, CANCELED) - پیش‌فرض: ACTIVE
- **note**: یادداشت

## نکات مهم:
- کد پرسنلی تکراری در فایل مجاز نیست
- کارمند نباید قبلاً در این دوره ثبت شده باشد
- دوره باید در وضعیت DRAFT یا RECIPIENTS_IMPORTED باشد`,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'فایل اکسل حاوی اطلاعات دریافت‌کنندگان (فرمت‌های .xlsx, .xls)',
        },
      },
      example: {
        file: 'recipients.xlsx',
      },
    },
  })
  @ApiCreatedResponse({ 
    type: ImportRecipientsResultDto,
    description: 'اطلاعات نتیجه عملیات ایمپورت شامل تعداد وارد شده، رد شده و خطاها',
  })
  @ApiNotFoundResponse({ description: 'دوره توزیع با شناسه مشخص شده یافت نشد' })
  @ApiBadRequestResponse({ 
    description: 'خطاهای احتمالی:',
    schema: {
      example: {
        statusCode: 400,
        message: 'Excel file is required',
        error: 'Bad Request',
      },
    },
  })
  @ApiConflictResponse({ 
    description: 'در صورتی که کارمندی قبلاً در این دوره ثبت شده باشد یا کد پرسنلی تکراری در فایل وجود داشته باشد',
  })
  importRecipients(
    @Param('periodId', ParseUUIDPipe) periodId: string,
    @UploadedFile() file: { buffer: Buffer },
  ): Promise<ImportRecipientsResultDto> {
    return this.importsService.importRecipients(periodId, file);
  }
}
