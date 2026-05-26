// src\companies\companies.controller.ts
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
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { Company } from './company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ImportCompaniesResultDto } from './dto/import-companies-result.dto';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({ summary: 'Create company' })
  @ApiCreatedResponse({ type: Company })
  create(@Body() createCompanyDto: CreateCompanyDto): Promise<Company> {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @ApiOperation({ summary: 'List companies' })
  @ApiOkResponse({ type: [Company] })
  findAll(): Promise<Company[]> {
    return this.companiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by id' })
  @ApiOkResponse({ type: Company })
  findOne(@Param('id') id: string): Promise<Company> {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update company' })
  @ApiOkResponse({ type: Company })
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete company' })
  @ApiOkResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.companiesService.remove(id);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Import companies from Excel',
    description: `
Upload an Excel file (.xlsx or .xls) to import companies.

### Supported Columns

| Column | Required | Description |
|---|---:|---|
| \`name\` | Yes | The legal name of the company. |
| \`code\` | No | A unique identifier code for the company. |

### Data Rules

- **Names must be unique.**
- **Codes, if provided, must be unique.**
- Column headers are case-insensitive.
- Column headers can use spaces, underscores, or hyphens.
- Accepted examples for the name column include:
  - \`name\`
  - \`Company Name\`
  - \`company_name\`
  - \`company-name\`

### Behavior

- Existing companies with the same name or code will be skipped.
- Duplicate names or codes within the uploaded file will be skipped.
- The result returns:
  - A summary of imported rows.
  - A summary of skipped rows.
  - Specific error messages for skipped rows.

**Note:** Headers are normalized during processing by converting to lowercase and removing spaces, underscores, and hyphens.
`,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiCreatedResponse({ type: ImportCompaniesResultDto })
  importCompanies(
    @UploadedFile() file: { buffer: Buffer },
  ): Promise<ImportCompaniesResultDto> {
    return this.companiesService.importCompanies(file);
  }
}
