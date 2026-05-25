// src\imports\imports.service.ts
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
import { Employee } from '../employees/employee.entity';
import { DistributionPeriod } from '../periods/distribution-period.entity';
import { DistributionPeriodStatus } from '../periods/distribution-period-status.enum';
import { PeriodRecipient } from '../periods/period-recipient.entity';
import { PeriodRecipientStatus } from '../periods/period-recipient-status.enum';
import { ImportRecipientsResultDto } from './dto/import-recipients-result.dto';

type ExcelRow = Record<string, unknown>;

@Injectable()
export class ImportsService {
  constructor(
    @InjectRepository(DistributionPeriod)
    private readonly periodsRepository: Repository<DistributionPeriod>,
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(PeriodRecipient)
    private readonly recipientsRepository: Repository<PeriodRecipient>,
  ) {}

  async importRecipients(
    periodId: string,
    file?: { buffer: Buffer },
  ): Promise<ImportRecipientsResultDto> {
    if (!file?.buffer) {
      throw new BadRequestException('Excel file is required');
    }

    const period = await this.getWritablePeriod(periodId);
    const rows = this.readRows(file.buffer);
    const seenPersonnelCodes = new Set<string>();
    const errors: string[] = [];
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
        throw new ConflictException(
          `Employee ${personnelCode} already exists in this period`,
        );
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

    if (imported > 0 && period.status === DistributionPeriodStatus.DRAFT) {
      period.status = DistributionPeriodStatus.RECIPIENTS_IMPORTED;
      await this.periodsRepository.save(period);
    }

    return {
      periodId,
      imported,
      skipped,
      errors,
    };
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

  private async getWritablePeriod(
    periodId: string,
  ): Promise<DistributionPeriod> {
    const period = await this.periodsRepository.findOne({
      where: { id: periodId },
    });

    if (!period) {
      throw new NotFoundException('Distribution period not found');
    }

    if (period.status === DistributionPeriodStatus.ARCHIVED) {
      throw new BadRequestException('Archived period is read-only');
    }

    if (
      period.status !== DistributionPeriodStatus.DRAFT &&
      period.status !== DistributionPeriodStatus.RECIPIENTS_IMPORTED
    ) {
      throw new BadRequestException('Recipients cannot be imported now');
    }

    return period;
  }

  private async upsertEmployee(
    row: ExcelRow,
    personnelCode: string,
    fullName: string,
  ): Promise<Employee> {
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

    return this.employeesRepository.save(
      this.employeesRepository.create({
        personnelCode,
        fullName,
        company,
        isActive: true,
      }),
    );
  }

  private async getCompany(row: ExcelRow): Promise<Company | null> {
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

    return this.companiesRepository.save(
      this.companiesRepository.create({
        code: code || null,
        name: name || code,
        isActive: true,
      }),
    );
  }

  private getRecipientStatus(row: ExcelRow): PeriodRecipientStatus {
    const status = this.getCell(row, 'status').toUpperCase();

    if (!status) {
      return PeriodRecipientStatus.ACTIVE;
    }

    if (status in PeriodRecipientStatus) {
      return status as PeriodRecipientStatus;
    }

    throw new BadRequestException(`Invalid recipient status: ${status}`);
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
}
