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
exports.CompaniesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const XLSX = __importStar(require("xlsx"));
const company_entity_1 = require("./company.entity");
let CompaniesService = class CompaniesService {
    companiesRepository;
    constructor(companiesRepository) {
        this.companiesRepository = companiesRepository;
    }
    async create(createCompanyDto) {
        await this.ensureUniqueCode(createCompanyDto.code);
        const company = this.companiesRepository.create(createCompanyDto);
        return this.companiesRepository.save(company);
    }
    findAll() {
        return this.companiesRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const company = await this.companiesRepository.findOne({
            where: { id },
        });
        if (!company) {
            throw new common_1.NotFoundException('Company not found');
        }
        return company;
    }
    async update(id, updateCompanyDto) {
        const company = await this.findOne(id);
        if (updateCompanyDto.code && updateCompanyDto.code !== company.code) {
            await this.ensureUniqueCode(updateCompanyDto.code);
        }
        Object.assign(company, updateCompanyDto);
        return this.companiesRepository.save(company);
    }
    async remove(id) {
        const company = await this.findOne(id);
        await this.companiesRepository.remove(company);
    }
    async importCompanies(file) {
        if (!file?.buffer) {
            throw new common_1.BadRequestException('Excel file is required');
        }
        const rows = this.readRows(file.buffer);
        const seenCodes = new Set();
        const seenNames = new Set();
        const errors = [];
        let imported = 0;
        let skipped = 0;
        for (const [index, row] of rows.entries()) {
            const rowNumber = index + 2;
            const code = this.getCell(row, 'code');
            const name = this.getCell(row, 'name');
            if (!name) {
                skipped++;
                errors.push(`Row ${rowNumber}: name is required`);
                continue;
            }
            if (code && seenCodes.has(code)) {
                skipped++;
                errors.push(`Row ${rowNumber}: duplicate code in file`);
                continue;
            }
            if (seenNames.has(name)) {
                skipped++;
                errors.push(`Row ${rowNumber}: duplicate name in file`);
                continue;
            }
            if (code) {
                seenCodes.add(code);
            }
            seenNames.add(name);
            const existingCompany = await this.companiesRepository.findOne({
                where: { code: code || undefined },
            });
            if (existingCompany) {
                skipped++;
                errors.push(`Row ${rowNumber}: company with code '${code}' already exists`);
                continue;
            }
            const companyByName = await this.companiesRepository.findOne({
                where: { name },
            });
            if (companyByName) {
                skipped++;
                errors.push(`Row ${rowNumber}: company with name '${name}' already exists`);
                continue;
            }
            const company = this.companiesRepository.create({
                code: code || null,
                name,
                isActive: true,
            });
            await this.companiesRepository.save(company);
            imported++;
        }
        return {
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
    async ensureUniqueCode(code) {
        if (!code) {
            return;
        }
        const existingCompany = await this.companiesRepository.findOne({
            where: { code },
        });
        if (existingCompany) {
            throw new common_1.ConflictException('Company code already exists');
        }
    }
};
exports.CompaniesService = CompaniesService;
exports.CompaniesService = CompaniesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CompaniesService);
//# sourceMappingURL=companies.service.js.map