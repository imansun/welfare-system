// src/employees/employees.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { Company } from '../companies/company.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { ImportEmployeesResultDto } from './dto/import-employees-result.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './employee.entity';

type ExcelRow = Record<string, unknown>;

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    await this.ensureUniquePersonnelCode(createEmployeeDto.personnelCode);

    const employee = this.employeesRepository.create({
      personnelCode: createEmployeeDto.personnelCode,
      fullName: createEmployeeDto.fullName,
      isActive: createEmployeeDto.isActive ?? true,
      company: await this.getCompany(createEmployeeDto.companyId),
    });

    return this.employeesRepository.save(employee);
  }

  findAll(): Promise<Employee[]> {
    return this.employeesRepository.find({
      relations: { company: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeesRepository.findOne({
      where: { id },
      relations: { company: true },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    const employee = await this.findOne(id);

    if (
      updateEmployeeDto.personnelCode !== undefined &&
      updateEmployeeDto.personnelCode !== employee.personnelCode
    ) {
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

  async remove(id: string): Promise<void> {
    const employee = await this.findOne(id);
    await this.employeesRepository.softRemove(employee);
  }

  async importEmployees(
    file?: { buffer: Buffer },
  ): Promise<ImportEmployeesResultDto> {
    if (!file?.buffer) {
      throw new BadRequestException('Excel file is required');
    }

    const rows = this.readRows(file.buffer);

    if (!rows.length) {
      throw new BadRequestException('Excel file has no data rows');
    }

    const seenPersonnelCodes = new Set<string>();
    const errors: string[] = [];

    let imported = 0;
    let updated = 0;
    let skipped = 0;

    for (const [index, row] of rows.entries()) {
      const rowNumber = index + 2;

      try {
        const personnelCode = this.getCell(
          row,
          'personnelCode',
          'personnel_code',
          'کد پرسنلی',
        );

        const fullName = this.getCell(
          row,
          'fullName',
          'full_name',
          'نام و نام خانوادگی',
          'نام',
        );

        const isActiveValue = this.getCell(
          row,
          'isActive',
          'is_active',
          'فعال',
          'وضعیت',
        );

        if (!personnelCode || !fullName) {
          skipped++;
          errors.push(
            `Row ${rowNumber}: personnelCode and fullName are required`,
          );
          continue;
        }

        if (seenPersonnelCodes.has(personnelCode)) {
          skipped++;
          errors.push(
            `Row ${rowNumber}: duplicate personnelCode in file: ${personnelCode}`,
          );
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
      } catch (error) {
        skipped++;
        errors.push(
          `Row ${rowNumber}: ${
            error instanceof Error ? error.message : 'unexpected error'
          }`,
        );
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

  private async ensureUniquePersonnelCode(
    personnelCode: string,
    currentEmployeeId?: string,
  ): Promise<void> {
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
      throw new ConflictException('Personnel code already exists');
    }
  }

  private async getCompany(companyId?: string): Promise<Company | null> {
    if (!companyId) {
      return null;
    }

    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  private async resolveCompany(row: ExcelRow): Promise<Company | null> {
    const companyCode = this.getCell(
      row,
      'companyCode',
      'company_code',
      'کد شرکت',
    );

    const companyName = this.getCell(
      row,
      'companyName',
      'company_name',
      'نام شرکت',
      'شرکت',
    );

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

    return this.companiesRepository.save(
      this.companiesRepository.create({
        code: companyCode || null,
        name: companyName || companyCode,
        isActive: true,
      }),
    );
  }

  private readRows(buffer: Buffer): ExcelRow[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw new BadRequestException('Excel file has no sheets');
    }

    const sheet = workbook.Sheets[sheetName];

    return XLSX.utils.sheet_to_json<ExcelRow>(sheet, {
      defval: '',
    });
  }

  private getCell(row: ExcelRow, ...keys: string[]): string {
    const normalizedRow = Object.entries(row).reduce<Record<string, unknown>>(
      (result, [key, value]) => {
        result[this.normalizeKey(key)] = value;
        return result;
      },
      {},
    );

    for (const key of keys) {
      const value = normalizedRow[this.normalizeKey(key)];

      if (value !== undefined && value !== null) {
        return String(value).trim();
      }
    }

    return '';
  }

  private normalizeKey(key: string): string {
    return key.replace(/[\s_-]/g, '').toLowerCase();
  }

  private parseBoolean(value: string, defaultValue = true): boolean {
    if (!value) {
      return defaultValue;
    }

    const normalized = value.trim().toLowerCase();

    if (
      [
        'true',
        '1',
        'yes',
        'y',
        'active',
        'فعال',
        'بلی',
        'بله',
      ].includes(normalized)
    ) {
      return true;
    }

    if (
      [
        'false',
        '0',
        'no',
        'n',
        'inactive',
        'غیرفعال',
        'غيرفعال',
        'خیر',
        'نه',
      ].includes(normalized)
    ) {
      return false;
    }

    throw new BadRequestException(`Invalid boolean value: ${value}`);
  }
}
