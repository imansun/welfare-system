import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ImportCompaniesResultDto } from './dto/import-companies-result.dto';
export declare class CompaniesService {
    private readonly companiesRepository;
    constructor(companiesRepository: Repository<Company>);
    create(createCompanyDto: CreateCompanyDto): Promise<Company>;
    findAll(): Promise<Company[]>;
    findOne(id: string): Promise<Company>;
    update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company>;
    remove(id: string): Promise<void>;
    importCompanies(file?: {
        buffer: Buffer;
    }): Promise<ImportCompaniesResultDto>;
    private readRows;
    private getCell;
    private normalizeKey;
    private ensureUniqueCode;
}
