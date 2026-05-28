"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfReportService = void 0;
const common_1 = require("@nestjs/common");
const PDFDocument = require("pdfkit");
let PdfReportService = class PdfReportService {
    async generate(employees, fields = []) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                margin: 40,
                size: 'A4',
            });
            const chunks = [];
            doc.on('data', (chunk) => {
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
    resolveField(employee, field) {
        const value = employee[field];
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
    isLoanItem(item) {
        return (typeof item === 'object' &&
            item !== null &&
            'loanName' in item);
    }
    isTitleValueItem(item) {
        return (typeof item === 'object' &&
            item !== null &&
            'title' in item);
    }
    getFieldTitle(field) {
        const titles = {
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
};
exports.PdfReportService = PdfReportService;
exports.PdfReportService = PdfReportService = __decorate([
    (0, common_1.Injectable)()
], PdfReportService);
//# sourceMappingURL=pdf-report.service.js.map