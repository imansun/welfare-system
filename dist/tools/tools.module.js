"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolsModule = void 0;
const common_1 = require("@nestjs/common");
const tools_controller_1 = require("./tools.controller");
const xml_parser_service_1 = require("./services/xml-parser.service");
const salary_receipt_extractor_service_1 = require("./services/salary-receipt-extractor.service");
const report_generator_service_1 = require("./services/report-generator.service");
const excel_report_service_1 = require("./services/excel-report.service");
const pdf_report_service_1 = require("./services/pdf-report.service");
let ToolsModule = class ToolsModule {
};
exports.ToolsModule = ToolsModule;
exports.ToolsModule = ToolsModule = __decorate([
    (0, common_1.Module)({
        controllers: [tools_controller_1.ToolsController],
        providers: [
            xml_parser_service_1.XmlParserService,
            salary_receipt_extractor_service_1.SalaryReceiptExtractorService,
            report_generator_service_1.ReportGeneratorService,
            excel_report_service_1.ExcelReportService,
            pdf_report_service_1.PdfReportService,
        ],
        exports: [
            xml_parser_service_1.XmlParserService,
            salary_receipt_extractor_service_1.SalaryReceiptExtractorService,
            report_generator_service_1.ReportGeneratorService,
        ],
    })
], ToolsModule);
//# sourceMappingURL=tools.module.js.map