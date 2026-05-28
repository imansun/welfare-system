import { Repository } from 'typeorm';
import { Company } from '../companies/company.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { ImportEmployeesResultDto } from './dto/import-employees-result.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './employee.entity';
export declare class EmployeesService {
    private readonly employeesRepository;
    private readonly companiesRepository;
    constructor(employeesRepository: Repository<Employee>, companiesRepository: Repository<Company>);
    create(createEmployeeDto: CreateEmployeeDto): Promise<Employee>;
    findAll(): Promise<Employee[]>;
    findOne(id: string): Promise<Employee>;
    update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee>;
    remove(id: string): Promise<void>;
    importEmployees(file?: {
        buffer: Buffer;
    }): Promise<ImportEmployeesResultDto>;
    private ensureUniquePersonnelCode;
    private getCompany;
    private resolveCompany;
    private readRows;
    private getCell;
    private normalizeKey;
    private parseBoolean;
}
