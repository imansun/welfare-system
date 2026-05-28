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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const excel_report_service_1 = require("./excel-report.service");
const pdf_report_service_1 = require("./pdf-report.service");
let ReportGeneratorService = class ReportGeneratorService {
    excelReportService;
    pdfReportService;
    constructor(excelReportService, pdfReportService) {
        this.excelReportService = excelReportService;
        this.pdfReportService = pdfReportService;
    }
    async generate(employees, format, fields) {
        const selectedFields = fields?.length ? fields : this.getDefaultFields();
        if (format === 'excel') {
            return this.excelReportService.generate(employees, selectedFields);
        }
        if (format === 'pdf') {
            return this.pdfReportService.generate(employees, selectedFields);
        }
        throw new common_1.BadRequestException('فرمت خروجی پشتیبانی نمی‌شود.');
    }
    getDefaultFields() {
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
};
exports.ReportGeneratorService = ReportGeneratorService;
exports.ReportGeneratorService = ReportGeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [excel_report_service_1.ExcelReportService,
        pdf_report_service_1.PdfReportService])
], ReportGeneratorService);
//# sourceMappingURL=report-generator.service.js.map