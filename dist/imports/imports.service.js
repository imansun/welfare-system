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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const XLSX = __importStar(require("xlsx"));
const company_entity_1 = require("../companies/company.entity");
const employee_entity_1 = require("../employees/employee.entity");
const distribution_period_entity_1 = require("../periods/distribution-period.entity");
const distribution_period_status_enum_1 = require("../periods/distribution-period-status.enum");
const period_recipient_entity_1 = require("../periods/period-recipient.entity");
const period_recipient_status_enum_1 = require("../periods/period-recipient-status.enum");
let ImportsService = class ImportsService {
    periodsRepository;
    employeesRepository;
    companiesRepository;
    recipientsRepository;
    constructor(periodsRepository, employeesRepository, companiesRepository, recipientsRepository) {
        this.periodsRepository = periodsRepository;
        this.employeesRepository = employeesRepository;
        this.companiesRepository = companiesRepository;
        this.recipientsRepository = recipientsRepository;
    }
    async importRecipients(periodId, file) {
        if (!file?.buffer) {
            throw new common_1.BadRequestException('Excel file is required');
        }
        const period = await this.getWritablePeriod(periodId);
        const rows = this.readRows(file.buffer);
        const seenPersonnelCodes = new Set();
        const errors = [];
        let imported = 0;
        let skipped = 0;
        for (const [index, row] of rows.entries()) {
            const rowNumber = index + 2;
            const personnelCode = this.getCell(row, 'personnelCode', 'personnel_code');
            const fullName = this.getCell(row, 'fullName', 'full_name');
            if (!personnelCode || !fullName) {
                skipped++;
                errors.push(`Row ${rowNumber}: personnelCode and fullName are required`);
                continue;
            }
            if (seenPersonnelCodes.has(personnelCode)) {
                skipped++;
                errors.push(`Row ${rowNumber}: duplicate personnelCode in file`);
                continue;
            }
            seenPersonnelCodes.add(personnelCode);
            const employee = await this.upsertEmployee(row, personnelCode, fullName);
            const existingRecipient = await this.recipientsRepository.findOne({
                where: {
                    period: { id: period.id },
                    employee: { id: employee.id },
                },
            });
            if (existingRecipient) {
                throw new common_1.ConflictException(`Employee ${personnelCode} already exists in this period`);
            }
            const recipient = this.recipientsRepository.create({
                period,
                employee,
                status: this.getRecipientStatus(row),
                note: this.getCell(row, 'note'),
            });
            await this.recipientsRepository.save(recipient);
            imported++;
        }
        if (imported > 0 && period.status === distribution_period_status_enum_1.DistributionPeriodStatus.DRAFT) {
            period.status = distribution_period_status_enum_1.DistributionPeriodStatus.RECIPIENTS_IMPORTED;
            await this.periodsRepository.save(period);
        }
        return {
            periodId,
            imported,
            skipped,
            errors,
        };
    }
    readRows(buffer) {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
            throw new common_1.BadRequestException('Excel file has no sheets');
        }
        const sheet = workbook.Sheets[sheetName];
        return XLSX.utils.sheet_to_json(sheet, {
            defval: '',
        });
    }
    async getWritablePeriod(periodId) {
        const period = await this.periodsRepository.findOne({
            where: { id: periodId },
        });
        if (!period) {
            throw new common_1.NotFoundException('Distribution period not found');
        }
        if (period.status === distribution_period_status_enum_1.DistributionPeriodStatus.ARCHIVED) {
            throw new common_1.BadRequestException('Archived period is read-only');
        }
        if (period.status !== distribution_period_status_enum_1.DistributionPeriodStatus.DRAFT &&
            period.status !== distribution_period_status_enum_1.DistributionPeriodStatus.RECIPIENTS_IMPORTED) {
            throw new common_1.BadRequestException('Recipients cannot be imported now');
        }
        return period;
    }
    async upsertEmployee(row, personnelCode, fullName) {
        const company = await this.getCompany(row);
        const employee = await this.employeesRepository.findOne({
            where: { personnelCode },
        });
        if (employee) {
            employee.fullName = fullName;
            employee.company = company;
            employee.isActive = true;
            return this.employeesRepository.save(employee);
        }
        return this.employeesRepository.save(this.employeesRepository.create({
            personnelCode,
            fullName,
            company,
            isActive: true,
        }));
    }
    async getCompany(row) {
        const code = this.getCell(row, 'companyCode', 'company_code');
        const name = this.getCell(row, 'companyName', 'company_name');
        if (!code && !name) {
            return null;
        }
        if (code) {
            const companyByCode = await this.companiesRepository.findOne({
                where: { code },
            });
            if (companyByCode) {
                return companyByCode;
            }
        }
        return this.companiesRepository.save(this.companiesRepository.create({
            code: code || null,
            name: name || code,
            isActive: true,
        }));
    }
    getRecipientStatus(row) {
        const status = this.getCell(row, 'status').toUpperCase();
        if (!status) {
            return period_recipient_status_enum_1.PeriodRecipientStatus.ACTIVE;
        }
        if (status in period_recipient_status_enum_1.PeriodRecipientStatus) {
            return status;
        }
        throw new common_1.BadRequestException(`Invalid recipient status: ${status}`);
    }
    getCell(row, ...keys) {
        const normalizedRow = Object.entries(row).reduce((result, [key, value]) => {
            result[this.normalizeKey(key)] = value;
            return result;
        }, {});
        for (const key of keys) {
            const value = normalizedRow[this.normalizeKey(key)];
            if (value !== undefined && value !== null) {
                return String(value).trim();
            }
        }
        return '';
    }
    normalizeKey(key) {
        return key.replace(/[\s_-]/g, '').toLowerCase();
    }
};
exports.ImportsService = ImportsService;
exports.ImportsService = ImportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(distribution_period_entity_1.DistributionPeriod)),
    __param(1, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __param(2, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __param(3, (0, typeorm_1.InjectRepository)(period_recipient_entity_1.PeriodRecipient)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ImportsService);
//# sourceMappingURL=imports.service.js.map