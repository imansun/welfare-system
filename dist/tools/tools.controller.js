"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ToolsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const generate_report_dto_1 = require("./dto/generate-report.dto");
const report_format_enum_1 = require("./interfaces/report-format.enum");
const report_generator_service_1 = require("./services/report-generator.service");
const salary_receipt_extractor_service_1 = require("./services/salary-receipt-extractor.service");
const xml_parser_service_1 = require("./services/xml-parser.service");
let ToolsController = ToolsController_1 = class ToolsController {
    xmlParserService;
    extractorService;
    reportGeneratorService;
    logger = new common_1.Logger(ToolsController_1.name);
    constructor(xmlParserService, extractorService, reportGeneratorService) {
        this.xmlParserService = xmlParserService;
        this.extractorService = extractorService;
        this.reportGeneratorService = reportGeneratorService;
    }
    async parseXml(file, body) {
        if (!file) {
            this.logger.error('Parse XML failed: No file provided.');
            throw new common_1.BadRequestException('فایل XML ارسال نشده است.');
        }
        this.logger.log(`Parse XML started. originalName="${file.originalname}", size=${file.size}, mime="${file.mimetype}"`);
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
        this.logger.log(`Filtering finished. total=${extracted.employees.length}, filtered=${filtered.length}`);
        return {
            count: filtered.length,
            data: filtered,
        };
    }
    async generateReport(file, dto, res) {
        if (!file) {
            this.logger.error('Generate report failed: No file provided.');
            throw new common_1.BadRequestException('فایل XML ارسال نشده است.');
        }
        this.logger.log(`Generate report started. originalName="${file.originalname}", size=${file.size}, format="${dto?.format}"`);
        const xmlContent = file.buffer.toString('utf-8');
        this.logger.debug('XML parsing for report started.');
        const parsedXml = this.xmlParserService.parse(xmlContent);
        this.logger.debug('XML parsing for report finished.');
        this.logger.debug('Extraction for report started.');
        const extracted = this.extractorService.extract(parsedXml);
        this.logger.log(`Extraction for report finished. employees=${extracted.employees.length}`);
        const buffer = await this.reportGeneratorService.generate(extracted.employees, dto.format, dto.fields);
        this.logger.log(`Report generated. bufferSize=${buffer.length}`);
        const isExcel = dto.format === report_format_enum_1.ReportFormat.EXCEL;
        res.setHeader('Content-Type', isExcel
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="salary-receipts.${isExcel ? 'xlsx' : 'pdf'}"`);
        return res.send(buffer);
    }
    filterEmployees(employees, filters) {
        const personnelCode = this.normalizeSearchValue(filters.personnelCode);
        const firstName = this.normalizeSearchValue(filters.firstName);
        const lastName = this.normalizeSearchValue(filters.lastName);
        const fullName = this.normalizeSearchValue(filters.fullName);
        const search = this.normalizeSearchValue(filters.search);
        const hasAny = personnelCode !== '' ||
            firstName !== '' ||
            lastName !== '' ||
            fullName !== '' ||
            search !== '';
        if (!hasAny)
            return employees;
        return employees.filter((e) => {
            const code = this.normalizeSearchValue(e.personnelCode);
            const name = this.normalizeSearchValue(e.fullName);
            if (personnelCode && !code.includes(personnelCode))
                return false;
            if (firstName && !name.includes(firstName))
                return false;
            if (lastName && !name.includes(lastName))
                return false;
            if (fullName && !name.includes(fullName))
                return false;
            if (search && !code.includes(search) && !name.includes(search))
                return false;
            return true;
        });
    }
    normalizeSearchValue(value) {
        if (!value)
            return '';
        return String(value)
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/ي/g, 'ی')
            .replace(/ك/g, 'ک')
            .toLowerCase();
    }
};
exports.ToolsController = ToolsController;
__decorate([
    (0, common_1.Post)('salary-receipt/parse'),
    (0, swagger_1.ApiOperation)({
        summary: 'Parse salary receipt XML',
        description: 'این اندپوینت فایل XML فیش حقوقی را دریافت می‌کند، آن را parse می‌کند و اطلاعات استخراج‌شده‌ی کارکنان را به‌صورت JSON برمی‌گرداند. برای بررسی صحت ساختار فایل و مشاهده داده‌های خام استخراج‌شده مناسب است. همچنین امکان جستجو بر اساس کد پرسنلی و نام/نام خانوادگی وجود دارد.',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'فایل XML فیش حقوقی + فیلدهای اختیاری برای جستجو (personnelCode / firstName / lastName / fullName / search)',
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
                    description: 'جستجوی عمومی (اختیاری)؛ روی کد پرسنلی و نام کامل اعمال می‌شود',
                    example: '200319',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'فایل با موفقیت پردازش شد و اطلاعات کارکنان استخراج گردید.',
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'فایل XML ارسال نشده یا درخواست نامعتبر است.',
        schema: {
            example: {
                statusCode: 400,
                message: 'فایل XML ارسال نشده است.',
                error: 'Bad Request',
            },
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ToolsController.prototype, "parseXml", null);
__decorate([
    (0, common_1.Post)('salary-receipt/report'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate salary receipt report',
        description: 'این اندپوینت فایل XML فیش حقوقی را دریافت می‌کند، داده‌های کارکنان را استخراج می‌کند و براساس فرمت درخواستی کاربر، خروجی Excel یا PDF تولید می‌کند. همچنین می‌توان فیلدهای دلخواه را برای درج در گزارش مشخص کرد.',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'فایل XML به همراه تنظیمات تولید گزارش. فیلد fields باید به‌صورت آرایه‌ای از نام فیلدها ارسال شود.',
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
                    enum: Object.values(report_format_enum_1.ReportFormat),
                    description: 'فرمت خروجی گزارش',
                    example: report_format_enum_1.ReportFormat.EXCEL,
                },
                fields: {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                    description: 'فهرست فیلدهایی که باید در خروجی گزارش نمایش داده شوند',
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'گزارش با موفقیت تولید شد و فایل خروجی به‌صورت attachment برگردانده می‌شود.',
        headers: {
            'Content-Type': {
                description: 'نوع فایل خروجی',
                schema: {
                    type: 'string',
                    example: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'فایل XML ارسال نشده، فرمت گزارش نامعتبر است یا داده‌های ورودی کامل نیست.',
        schema: {
            example: {
                statusCode: 400,
                message: 'فایل XML ارسال نشده است.',
                error: 'Bad Request',
            },
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, generate_report_dto_1.GenerateReportDto, Object]),
    __metadata("design:returntype", Promise)
], ToolsController.prototype, "generateReport", null);
exports.ToolsController = ToolsController = ToolsController_1 = __decorate([
    (0, swagger_1.ApiTags)('Tools'),
    (0, common_1.Controller)('tools'),
    __metadata("design:paramtypes", [xml_parser_service_1.XmlParserService,
        salary_receipt_extractor_service_1.SalaryReceiptExtractorService,
        report_generator_service_1.ReportGeneratorService])
], ToolsController);
//# sourceMappingURL=tools.controller.js.map