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
    description: 'Returns a list of all invoices with their items including unit prices'
  })
  @ApiOkResponse({ type: [Invoice], description: 'List of invoices with items and prices' })
  findAll(): Promise<Invoice[]> {
    return this.invoicesService.findAll();
  }

  @Get('period/:periodId')
  @ApiOperation({ 
    summary: 'List invoices by period',
    description: 'Returns all invoices generated for a specific distribution period'
  })
  @ApiOkResponse({ type: [Invoice], description: 'List of invoices for the specified period' })
  findByPeriod(
    @Param('periodId', ParseUUIDPipe) periodId: string,
  ): Promise<Invoice[]> {
    return this.invoicesService.findByPeriod(periodId);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get invoice by id',
    description: 'Returns a single invoice with its items including item names, quantities, and unit prices'
  })
  @ApiOkResponse({ type: Invoice, description: 'Invoice details with items and prices' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Invoice> {
    return this.invoicesService.findOne(id);
  }

  @Post('period/:periodId/generate')
  @ApiOperation({ 
    summary: 'Generate invoices for a period',
    description: 'Generates invoices for all distributors in a period based on period package items. Each invoice item includes the item name, unit name, quantity, and unit price (in Rials) copied from the period package items.'
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
