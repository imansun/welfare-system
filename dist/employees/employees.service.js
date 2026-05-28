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
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const XLSX = __importStar(require("xlsx"));
const company_entity_1 = require("../companies/company.entity");
const employee_entity_1 = require("./employee.entity");
let EmployeesService = class EmployeesService {
    employeesRepository;
    companiesRepository;
    constructor(employeesRepository, companiesRepository) {
        this.employeesRepository = employeesRepository;
        this.companiesRepository = companiesRepository;
    }
    async create(createEmployeeDto) {
        await this.ensureUniquePersonnelCode(createEmployeeDto.personnelCode);
        const employee = this.employeesRepository.create({
            personnelCode: createEmployeeDto.personnelCode,
            fullName: createEmployeeDto.fullName,
            isActive: createEmployeeDto.isActive ?? true,
            company: await this.getCompany(createEmployeeDto.companyId),
        });
        return this.employeesRepository.save(employee);
    }
    findAll() {
        return this.employeesRepository.find({
            relations: { company: true },
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const employee = await this.employeesRepository.findOne({
            where: { id },
            relations: { company: true },
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        return employee;
    }
    async update(id, updateEmployeeDto) {
        const employee = await this.findOne(id);
        if (updateEmployeeDto.personnelCode !== undefined &&
            updateEmployeeDto.personnelCode !== employee.personnelCode) {
            await this.ensureUniquePersonnelCode(updateEmployeeDto.personnelCode, id);
            employee.personnelCode = updateEmployeeDto.personnelCode;
        }
        if (updateEmployeeDto.fullName !== undefined) {
            employee.fullName = updateEmployeeDto.fullName;
        }
        if (updateEmployeeDto.isActive !== undefined) {
            employee.isActive = updateEmployeeDto.isActive;
        }
        if (updateEmployeeDto.companyId !== undefined) {
            employee.company = await this.getCompany(updateEmployeeDto.companyId);
        }
        return this.employeesRepository.save(employee);
    }
    async remove(id) {
        const employee = await this.findOne(id);
        await this.employeesRepository.softRemove(employee);
    }
    async importEmployees(file) {
        if (!file?.buffer) {
            throw new common_1.BadRequestException('Excel file is required');
        }
        const rows = this.readRows(file.buffer);
        if (!rows.length) {
            throw new common_1.BadRequestException('Excel file has no data rows');
        }
        const seenPersonnelCodes = new Set();
        const errors = [];
        let imported = 0;
        let updated = 0;
        let skipped = 0;
        for (const [index, row] of rows.entries()) {
            const rowNumber = index + 2;
            try {
                const personnelCode = this.getCell(row, 'personnelCode', 'personnel_code', 'کد پرسنلی');
                const fullName = this.getCell(row, 'fullName', 'full_name', 'نام و نام خانوادگی', 'نام');
                const isActiveValue = this.getCell(row, 'isActive', 'is_active', 'فعال', 'وضعیت');
                if (!personnelCode || !fullName) {
                    skipped++;
                    errors.push(`Row ${rowNumber}: personnelCode and fullName are required`);
                    continue;
                }
                if (seenPersonnelCodes.has(personnelCode)) {
                    skipped++;
                    errors.push(`Row ${rowNumber}: duplicate personnelCode in file: ${personnelCode}`);
                    continue;
                }
                seenPersonnelCodes.add(personnelCode);
                const company = await this.resolveCompany(row);
                const isActive = this.parseBoolean(isActiveValue, true);
                const existingEmployee = await this.employeesRepository.findOne({
                    where: { personnelCode },
                    relations: { company: true },
                });
                if (existingEmployee) {
                    existingEmployee.fullName = fullName;
                    existingEmployee.company = company;
                    existingEmployee.isActive = isActive;
                    await this.employeesRepository.save(existingEmployee);
                    updated++;
                    continue;
                }
                const employee = this.employeesRepository.create({
                    personnelCode,
                    fullName,
                    company,
                    isActive,
                });
                await this.employeesRepository.save(employee);
                imported++;
            }
            catch (error) {
                skipped++;
                errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'unexpected error'}`);
            }
        }
        return {
            totalRows: rows.length,
            imported,
            updated,
            skipped,
            errors,
        };
    }
    async ensureUniquePersonnelCode(personnelCode, currentEmployeeId) {
        const query = this.employeesRepository
            .createQueryBuilder('employee')
            .where('employee.personnelCode = :personnelCode', { personnelCode });
        if (currentEmployeeId) {
            query.andWhere('employee.id != :currentEmployeeId', {
                currentEmployeeId,
            });
        }
        const existingEmployee = await query.getOne();
        if (existingEmployee) {
            throw new common_1.ConflictException('Personnel code already exists');
        }
    }
    async getCompany(companyId) {
        if (!companyId) {
            return null;
        }
        const company = await this.companiesRepository.findOne({
            where: { id: companyId },
        });
        if (!company) {
            throw new common_1.NotFoundException('Company not found');
        }
        return company;
    }
    async resolveCompany(row) {
        const companyCode = this.getCell(row, 'companyCode', 'company_code', 'کد شرکت');
        const companyName = this.getCell(row, 'companyName', 'company_name', 'نام شرکت', 'شرکت');
        if (!companyCode && !companyName) {
            return null;
        }
        if (companyCode) {
            const companyByCode = await this.companiesRepository.findOne({
                where: { code: companyCode },
            });
            if (companyByCode) {
                return companyByCode;
            }
        }
        if (companyName) {
            const companyByName = await this.companiesRepository.findOne({
                where: { name: companyName },
            });
            if (companyByName) {
                return companyByName;
            }
        }
        return this.companiesRepository.save(this.companiesRepository.create({
            code: companyCode || null,
            name: companyName || companyCode,
            isActive: true,
        }));
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
    parseBoolean(value, defaultValue = true) {
        if (!value) {
            return defaultValue;
        }
        const normalized = value.trim().toLowerCase();
        if ([
            'true',
            '1',
            'yes',
            'y',
            'active',
            'فعال',
            'بلی',
            'بله',
        ].includes(normalized)) {
            return true;
        }
        if ([
            'false',
            '0',
            'no',
            'n',
            'inactive',
            'غیرفعال',
            'غيرفعال',
            'خیر',
            'نه',
        ].includes(normalized)) {
            return false;
        }
        throw new common_1.BadRequestException(`Invalid boolean value: ${value}`);
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __param(1, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map