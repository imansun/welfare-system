"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelReportService = void 0;
const common_1 = require("@nestjs/common");
const ExcelJS = __importStar(require("exceljs"));
let ExcelReportService = class ExcelReportService {
    async generate(employees, fields) {
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
    flattenEmployee(employee, fields) {
        const row = {};
        for (const field of fields) {
            const value = this.resolveField(employee, field);
            row[field] = value;
        }
        return row;
    }
    resolveField(employee, field) {
        const value = employee[field];
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
exports.ExcelReportService = ExcelReportService;
exports.ExcelReportService = ExcelReportService = __decorate([
    (0, common_1.Injectable)()
], ExcelReportService);
//# sourceMappingURL=excel-report.service.js.map