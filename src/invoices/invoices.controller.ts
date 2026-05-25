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
  @ApiOperation({ summary: 'List invoices' })
  @ApiOkResponse({ type: [Invoice] })
  findAll(): Promise<Invoice[]> {
    return this.invoicesService.findAll();
  }

  @Get('period/:periodId')
  @ApiOperation({ summary: 'List invoices by period' })
  @ApiOkResponse({ type: [Invoice] })
  findByPeriod(
    @Param('periodId', ParseUUIDPipe) periodId: string,
  ): Promise<Invoice[]> {
    return this.invoicesService.findByPeriod(periodId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by id' })
  @ApiOkResponse({ type: Invoice })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Invoice> {
    return this.invoicesService.findOne(id);
  }

  @Post('period/:periodId/generate')
  @ApiOperation({ summary: 'Generate invoices for a period' })
  @ApiCreatedResponse({ type: GenerateInvoicesResultDto })
  generateForPeriod(
    @Param('periodId', ParseUUIDPipe) periodId: string,
  ): Promise<GenerateInvoicesResultDto> {
    return this.invoicesService.generateForPeriod(periodId);
  }
}
