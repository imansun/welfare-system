import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { Company } from './company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ImportCompaniesResultDto } from './dto/import-companies-result.dto';

type ExcelRow = Record<string, unknown>;

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    await this.ensureUniqueCode(createCompanyDto.code);

    const company = this.companiesRepository.create(createCompanyDto);
    return this.companiesRepository.save(company);
  }

  findAll(): Promise<Company[]> {
    return this.companiesRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companiesRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    const company = await this.findOne(id);

    if (updateCompanyDto.code && updateCompanyDto.code !== company.code) {
      await this.ensureUniqueCode(updateCompanyDto.code);
    }

    Object.assign(company, updateCompanyDto);
    return this.companiesRepository.save(company);
  }

  async remove(id: string): Promise<void> {
    const company = await this.findOne(id);
    await this.companiesRepository.remove(company);
  }

  async importCompanies(file?: { buffer: Buffer }): Promise<ImportCompaniesResultDto> {
    if (!file?.buffer) {
      throw new BadRequestException('Excel file is required');
    }

    const rows = this.readRows(file.buffer);
    const seenCodes = new Set<string>();
    const seenNames = new Set<string>();
    const errors: string[] = [];
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

  private async ensureUniqueCode(code?: string): Promise<void> {
    if (!code) {
      return;
    }

    const existingCompany = await this.companiesRepository.findOne({
      where: { code },
    });

    if (existingCompany) {
      throw new ConflictException('Company code already exists');
    }
  }
}
