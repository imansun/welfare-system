import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../companies/company.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './employee.entity';

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
      isActive: createEmployeeDto.isActive,
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
      updateEmployeeDto.personnelCode &&
      updateEmployeeDto.personnelCode !== employee.personnelCode
    ) {
      await this.ensureUniquePersonnelCode(updateEmployeeDto.personnelCode);
    }

    if (updateEmployeeDto.personnelCode !== undefined) {
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
    await this.employeesRepository.remove(employee);
  }

  private async ensureUniquePersonnelCode(
    personnelCode: string,
  ): Promise<void> {
    const existingEmployee = await this.employeesRepository.findOne({
      where: { personnelCode },
    });

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
}
