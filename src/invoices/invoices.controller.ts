import { Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GenerateInvoicesResultDto } from './dto/generate-invoices-result.dto';
import { Invoice } from './invoice.entity';
import { InvoicesService } from './invoices.service';

@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ 
    summary: 'List invoices',
    description: 'Returns a list of all invoices. Each invoice includes: period title, employee name, personnel code, invoice items (with item name, unit name, quantity, unit price), and total amount.'
  })
  @ApiOkResponse({ type: [Invoice], description: 'List of invoices with period info, employee details, items (name, unit, quantity, price), and total amount' })
  findAll(): Promise<Invoice[]> {
    return this.invoicesService.findAll();
  }

  @Get('period/:periodId')
  @ApiOperation({ 
    summary: 'List invoices by period',
    description: 'Returns all invoices generated for a specific distribution period. Each invoice includes: period title, employee name, personnel code, invoice items (with item name, unit name, quantity, unit price), and total amount.'
  })
  @ApiOkResponse({ type: [Invoice], description: 'List of invoices for the specified period with employee details, items, and total amounts' })
  findByPeriod(
    @Param('periodId', ParseUUIDPipe) periodId: string,
  ): Promise<Invoice[]> {
    return this.invoicesService.findByPeriod(periodId);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get invoice by id',
    description: 'Returns a single invoice with full details including: period title, employee name, personnel code, company name (if any), invoice items (item name, unit name, quantity, unit price in Rials), and total amount.'
  })
  @ApiOkResponse({ type: Invoice, description: 'Invoice details with period title, employee info, items (name, unit, quantity, price), and total amount' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Invoice> {
    return this.invoicesService.findOne(id);
  }

  @Post('period/:periodId/generate')
  @ApiOperation({ 
    summary: 'Generate invoices for a period',
    description: 'Generates invoices for all distributors in a period based on period package items. Each invoice includes: period title, employee name, personnel code, and invoice items with item name, unit name, quantity, and unit price (in Rials) copied from the period package items. Total amount is calculated as the sum of (quantity × price) for all items.'
  })
  @ApiCreatedResponse({ 
    type: GenerateInvoicesResultDto, 
    description: 'Result of invoice generation including count of created invoices'
  })
  generateForPeriod(
    @Param('periodId', ParseUUIDPipe) periodId: string,
  ): Promise<GenerateInvoicesResultDto> {
    return this.invoicesService.generateForPeriod(periodId);
  }
}
