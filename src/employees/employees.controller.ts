// src/employees/employees.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { ImportEmployeesResultDto } from './dto/import-employees-result.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './employee.entity';
import { EmployeesService } from './employees.service';

@ApiTags('employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @ApiOperation({ summary: 'Create employee' })
  @ApiBody({ type: CreateEmployeeDto })
  @ApiCreatedResponse({ type: Employee })
  create(@Body() createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    return this.employeesService.create(createEmployeeDto);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Import employees from Excel file',
    description:
      'Import employees from an Excel file. The file must be sent as multipart/form-data with the field name "file". Supported columns include personnelCode, fullName, companyCode, companyName and isActive.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Excel file for importing employees',
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Excel file (.xlsx or .xls)',
        },
      },
    },
  })
  @ApiOkResponse({ type: ImportEmployeesResultDto })
  importEmployees(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImportEmployeesResultDto> {
    return this.employeesService.importEmployees(file);
  }

  @Get()
  @ApiOperation({ summary: 'List employees' })
  @ApiOkResponse({ type: [Employee] })
  findAll(): Promise<Employee[]> {
    return this.employeesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by id' })
  @ApiOkResponse({ type: Employee })
  findOne(@Param('id') id: string): Promise<Employee> {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update employee' })
  @ApiOkResponse({ type: Employee })
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete employee' })
  @ApiOkResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.employeesService.remove(id);
  }
}
