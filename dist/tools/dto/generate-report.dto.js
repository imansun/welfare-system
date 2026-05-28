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
exports.GenerateReportDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const report_format_enum_1 = require("../interfaces/report-format.enum");
class GenerateReportDto {
    format;
    fields;
}
exports.GenerateReportDto = GenerateReportDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: report_format_enum_1.ReportFormat,
        enumName: 'ReportFormat',
        example: report_format_enum_1.ReportFormat.EXCEL,
        description: 'فرمت خروجی گزارش',
    }),
    (0, class_validator_1.IsEnum)(report_format_enum_1.ReportFormat),
    __metadata("design:type", String)
], GenerateReportDto.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
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
        description: 'فهرست فیلدهایی که باید در گزارش نهایی نمایش داده شوند. اگر ارسال نشود، سرویس می‌تواند فیلدهای پیش‌فرض را استفاده کند.',
    }),
    (0, class_transformer_1.Transform)(({ value }) => {
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
            }
            catch {
                return value.includes(',')
                    ? value.split(',').map((item) => item.trim()).filter(Boolean)
                    : [value];
            }
        }
        return undefined;
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], GenerateReportDto.prototype, "fields", void 0);
//# sourceMappingURL=generate-report.dto.js.map