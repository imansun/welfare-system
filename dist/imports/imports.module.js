"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const company_entity_1 = require("../companies/company.entity");
const employee_entity_1 = require("../employees/employee.entity");
const distribution_period_entity_1 = require("../periods/distribution-period.entity");
const period_recipient_entity_1 = require("../periods/period-recipient.entity");
const imports_controller_1 = require("./imports.controller");
const imports_service_1 = require("./imports.service");
let ImportsModule = class ImportsModule {
};
exports.ImportsModule = ImportsModule;
exports.ImportsModule = ImportsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                distribution_period_entity_1.DistributionPeriod,
                employee_entity_1.Employee,
                company_entity_1.Company,
                period_recipient_entity_1.PeriodRecipient,
            ]),
        ],
        controllers: [imports_controller_1.ImportsController],
        providers: [imports_service_1.ImportsService],
    })
], ImportsModule);
//# sourceMappingURL=imports.module.js.map