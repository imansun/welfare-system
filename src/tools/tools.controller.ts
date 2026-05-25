// src/tools/tools.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { GenerateReportDto } from './dto/generate-report.dto';
import { ReportFormat } from './interfaces/report-format.enum';
import { ReportGeneratorService } from './services/report-generator.service';
import { SalaryReceiptExtractorService } from './services/salary-receipt-extractor.service';
import { XmlParserService } from './services/xml-parser.service';

@ApiTags('Tools')
@Controller('tools')
export class ToolsController {
  private readonly logger = new Logger(ToolsController.name);

  constructor(
    private readonly xmlParserService: XmlParserService,
    private readonly extractorService: SalaryReceiptExtractorService,
    private readonly reportGeneratorService: ReportGeneratorService,
  ) {}

  @Post('salary-receipt/parse')
  @ApiOperation({
    summary: 'Parse salary receipt XML',
    description:
      'این اندپوینت فایل XML فیش حقوقی را دریافت می‌کند، آن را parse می‌کند و اطلاعات استخراج‌شده‌ی کارکنان را به‌صورت JSON برمی‌گرداند. برای بررسی صحت ساختار فایل و مشاهده داده‌های خام استخراج‌شده مناسب است. همچنین امکان جستجو بر اساس کد پرسنلی و نام/نام خانوادگی وجود دارد.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'فایل XML فیش حقوقی + فیلدهای اختیاری برای جستجو (personnelCode / firstName / lastName / fullName / search)',
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'فایل XML ورودی',
        },
        personnelCode: {
          type: 'string',
          description: 'کد پرسنلی برای جستجو (اختیاری)',
          example: '200319',
        },
        firstName: {
          type: 'string',
          description: 'نام برای جستجو (اختیاری)',
          example: 'فاطمه',
        },
        lastName: {
          type: 'string',
          description: 'نام خانوادگی برای جستجو (اختیاری)',
          example: 'مقری کاخکی',
        },
        fullName: {
          type: 'string',
          description: 'نام کامل برای جستجو (اختیاری)',
          example: 'فاطمه مقری کاخکی',
        },
        search: {
          type: 'string',
          description:
            'جستجوی عمومی (اختیاری)؛ روی کد پرسنلی و نام کامل اعمال می‌شود',
          example: '200319',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description:
      'فایل با موفقیت پردازش شد و اطلاعات کارکنان استخراج گردید.',
    schema: {
      example: {
        count: 2,
        data: [
          {
            companyName: 'گل نقش توس',
            year: '1405',
            monthTitle: 'فروردین',
            receiptType: 'فیش حقوق ماه',
            fullName: 'فاطمه مقری کاخکی',
            personnelCode: '200319',
            organizationUnit: 'خدمات',
            jobTitle: 'کارگر خدمات',
            periodTitle: '4 روز و 01 ساعت و 30 دقیقه',
            loans: [
              {
                remainder: '10000000',
                installmentAmount: '500000',
                loanName: 'وام ضروری',
              },
            ],
            deductions: [
              {
                value: '1500000',
                title: 'بیمه تامین اجتماعی سهم کارمند',
              },
            ],
            payments: [
              {
                value: '12000000',
                title: 'حقوق پایه',
              },
            ],
            attendance: [
              {
                value: '4',
                title: 'کارکرد',
              },
            ],
            totalLoanInstallments: '500000',
            totalBenefits: '15000000',
            totalDeductions: '2000000',
            accountNumber: '1234567890',
            netPayment: '13000000',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'فایل XML ارسال نشده یا درخواست نامعتبر است.',
    schema: {
      example: {
        statusCode: 400,
        message: 'فایل XML ارسال نشده است.',
        error: 'Bad Request',
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async parseXml(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      personnelCode?: string;
      firstName?: string;
      lastName?: string;
      fullName?: string;
      search?: string;
    },
  ) {
    if (!file) {
      this.logger.error('Parse XML failed: No file provided.');
      throw new BadRequestException('فایل XML ارسال نشده است.');
    }

    this.logger.log(
      `Parse XML started. originalName="${file.originalname}", size=${file.size}, mime="${file.mimetype}"`,
    );

    const filters = {
      personnelCode: body?.personnelCode,
      firstName: body?.firstName,
      lastName: body?.lastName,
      fullName: body?.fullName,
      search: body?.search,
    };

    this.logger.debug(`Parse filters: ${JSON.stringify(filters)}`);

    const xmlContent = file.buffer.toString('utf-8');

    this.logger.debug('XML parsing started.');
    const parsedXml = this.xmlParserService.parse(xmlContent);
    this.logger.debug('XML parsing finished.');

    this.logger.debug('Extraction started.');
    const extracted = this.extractorService.extract(parsedXml);
    this.logger.log(`Extraction finished. employees=${extracted.employees.length}`);

    const filtered = this.filterEmployees(extracted.employees, filters);

    this.logger.log(
      `Filtering finished. total=${extracted.employees.length}, filtered=${filtered.length}`,
    );

    // حفظ ساختار خروجی (count/data)
    return {
      count: filtered.length,
      data: filtered,
    };
  }

  @Post('salary-receipt/report')
  @ApiOperation({
    summary: 'Generate salary receipt report',
    description:
      'این اندپوینت فایل XML فیش حقوقی را دریافت می‌کند، داده‌های کارکنان را استخراج می‌کند و براساس فرمت درخواستی کاربر، خروجی Excel یا PDF تولید می‌کند. همچنین می‌توان فیلدهای دلخواه را برای درج در گزارش مشخص کرد.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'فایل XML به همراه تنظیمات تولید گزارش. فیلد fields باید به‌صورت آرایه‌ای از نام فیلدها ارسال شود.',
    schema: {
      type: 'object',
      required: ['file', 'format'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'فایل XML ورودی',
        },
        format: {
          type: 'string',
          enum: Object.values(ReportFormat),
          description: 'فرمت خروجی گزارش',
          example: ReportFormat.EXCEL,
        },
        fields: {
          type: 'array',
          items: {
            type: 'string',
          },
          description:
            'فهرست فیلدهایی که باید در خروجی گزارش نمایش داده شوند',
          example: [
            'fullName',
            'personnelCode',
            'organizationUnit',
            'jobTitle',
            'netPayment',
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description:
      'گزارش با موفقیت تولید شد و فایل خروجی به‌صورت attachment برگردانده می‌شود.',
    headers: {
      'Content-Type': {
        description: 'نوع فایل خروجی',
        schema: {
          type: 'string',
          example:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      },
      'Content-Disposition': {
        description: 'نام فایل دانلودی',
        schema: {
          type: 'string',
          example: 'attachment; filename="salary-receipts.xlsx"',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'فایل XML ارسال نشده، فرمت گزارش نامعتبر است یا داده‌های ورودی کامل نیست.',
    schema: {
      example: {
        statusCode: 400,
        message: 'فایل XML ارسال نشده است.',
        error: 'Bad Request',
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async generateReport(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: GenerateReportDto,
    @Res() res: Response,
  ) {
    if (!file) {
      this.logger.error('Generate report failed: No file provided.');
      throw new BadRequestException('فایل XML ارسال نشده است.');
    }

    this.logger.log(
      `Generate report started. originalName="${file.originalname}", size=${file.size}, format="${dto?.format}"`,
    );

    const xmlContent = file.buffer.toString('utf-8');

    this.logger.debug('XML parsing for report started.');
    const parsedXml = this.xmlParserService.parse(xmlContent);
    this.logger.debug('XML parsing for report finished.');

    this.logger.debug('Extraction for report started.');
    const extracted = this.extractorService.extract(parsedXml);
    this.logger.log(`Extraction for report finished. employees=${extracted.employees.length}`);

    const buffer = await this.reportGeneratorService.generate(
      extracted.employees,
      dto.format,
      dto.fields,
    );

    this.logger.log(`Report generated. bufferSize=${buffer.length}`);

    const isExcel = dto.format === ReportFormat.EXCEL;

    res.setHeader(
      'Content-Type',
      isExcel
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf',
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="salary-receipts.${isExcel ? 'xlsx' : 'pdf'}"`,
    );

    return res.send(buffer);
  }

  private filterEmployees<
    T extends { fullName?: string | null; personnelCode?: string | null },
  >(
    employees: T[],
    filters: {
      personnelCode?: string;
      firstName?: string;
      lastName?: string;
      fullName?: string;
      search?: string;
    },
  ): T[] {
    const personnelCode = this.normalizeSearchValue(filters.personnelCode);
    const firstName = this.normalizeSearchValue(filters.firstName);
    const lastName = this.normalizeSearchValue(filters.lastName);
    const fullName = this.normalizeSearchValue(filters.fullName);
    const search = this.normalizeSearchValue(filters.search);

    const hasAny =
      personnelCode !== '' ||
      firstName !== '' ||
      lastName !== '' ||
      fullName !== '' ||
      search !== '';

    if (!hasAny) return employees;

    return employees.filter((e) => {
      const code = this.normalizeSearchValue(e.personnelCode);
      const name = this.normalizeSearchValue(e.fullName);

      // personnelCode: contains
      if (personnelCode && !code.includes(personnelCode)) return false;

      // firstName/lastName/fullName: contains inside fullName
      if (firstName && !name.includes(firstName)) return false;
      if (lastName && !name.includes(lastName)) return false;
      if (fullName && !name.includes(fullName)) return false;

      // search: against code OR fullName
      if (search && !code.includes(search) && !name.includes(search)) return false;

      return true;
    });
  }

  private normalizeSearchValue(value?: string | null): string {
    if (!value) return '';

    return String(value)
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/ي/g, 'ی')
      .replace(/ك/g, 'ک')
      .toLowerCase();
  }
}
