import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePeriodDto } from './dto/create-period.dto';
import { CreatePeriodPackageItemDto } from './dto/create-period-package-item.dto';
import { UpdatePeriodPackageItemDto } from './dto/update-period-package-item.dto';
import { UpdatePeriodDto } from './dto/update-period.dto';
import { DistributionPeriod } from './distribution-period.entity';
import { PeriodPackageItem } from './period-package-item.entity';
import { PeriodPackageItemsService } from './period-package-items.service';
import { PeriodsService } from './periods.service';

@ApiTags('periods')
@Controller('periods')
export class PeriodsController {
  constructor(
    private readonly periodsService: PeriodsService,
    private readonly packageItemsService: PeriodPackageItemsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create distribution period' })
  @ApiCreatedResponse({ type: DistributionPeriod })
  create(
    @Body() createPeriodDto: CreatePeriodDto,
  ): Promise<DistributionPeriod> {
    return this.periodsService.create(createPeriodDto);
  }

  @Get()
  @ApiOperation({ summary: 'List distribution periods' })
  @ApiOkResponse({ type: [DistributionPeriod] })
  findAll(): Promise<DistributionPeriod[]> {
    return this.periodsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get distribution period by id' })
  @ApiOkResponse({ type: DistributionPeriod })
  findOne(@Param('id') id: string): Promise<DistributionPeriod> {
    return this.periodsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update distribution period' })
  @ApiOkResponse({ type: DistributionPeriod })
  update(
    @Param('id') id: string,
    @Body() updatePeriodDto: UpdatePeriodDto,
  ): Promise<DistributionPeriod> {
    return this.periodsService.update(id, updatePeriodDto);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive distribution period' })
  @ApiCreatedResponse({ type: DistributionPeriod })
  archive(@Param('id') id: string): Promise<DistributionPeriod> {
    return this.periodsService.archive(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel distribution period' })
  @ApiCreatedResponse({ type: DistributionPeriod })
  cancel(@Param('id') id: string): Promise<DistributionPeriod> {
    return this.periodsService.cancel(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete distribution period' })
  @ApiOkResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.periodsService.remove(id);
  }

  @Post(':periodId/package-items')
  @ApiOperation({
    summary: 'Create period package item',
    description:
      'Add a new item to the period package with specified quantity and unit price. The price should be in Rials as a positive integer. Quantity can have up to 3 decimal places. Only periods in DRAFT or RECIPIENTS_IMPORTED status can be modified.',
  })
  @ApiCreatedResponse({
    type: PeriodPackageItem,
    description: 'Successfully created period package item',
  })
  createPackageItem(
    @Param('periodId') periodId: string,
    @Body() createDto: CreatePeriodPackageItemDto,
  ): Promise<PeriodPackageItem> {
    return this.packageItemsService.create(periodId, createDto);
  }

  @Get(':periodId/package-items')
  @ApiOperation({
    summary: 'List period package items',
    description:
      'Retrieve all items in the period package with their quantities, unit prices, and related item details including unit information.',
  })
  @ApiOkResponse({
    type: [PeriodPackageItem],
    description: 'Array of period package items',
  })
  findPackageItems(
    @Param('periodId') periodId: string,
  ): Promise<PeriodPackageItem[]> {
    return this.packageItemsService.findAll(periodId);
  }

  @Get(':periodId/package-items/:packageItemId')
  @ApiOperation({
    summary: 'Get period package item by id',
    description:
      'Retrieve a specific package item from the period by its ID, including item details and unit information.',
  })
  @ApiOkResponse({
    type: PeriodPackageItem,
    description: 'The requested period package item',
  })
  findPackageItem(
    @Param('periodId') periodId: string,
    @Param('packageItemId') packageItemId: string,
  ): Promise<PeriodPackageItem> {
    return this.packageItemsService.findOne(periodId, packageItemId);
  }

  @Patch(':periodId/package-items/:packageItemId')
  @ApiOperation({
    summary: 'Update period package item',
    description:
      'Update quantity, price, or note of an existing package item. Only periods in DRAFT, RECIPIENTS_IMPORTED, or PACKAGE_DEFINED status can be modified. Archived, INVOICED, and CANCELED periods are read-only.',
  })
  @ApiOkResponse({
    type: PeriodPackageItem,
    description: 'Updated period package item',
  })
  updatePackageItem(
    @Param('periodId') periodId: string,
    @Param('packageItemId') packageItemId: string,
    @Body() updateDto: UpdatePeriodPackageItemDto,
  ): Promise<PeriodPackageItem> {
    return this.packageItemsService.update(periodId, packageItemId, updateDto);
  }

  @Delete(':periodId/package-items/:packageItemId')
  @ApiOperation({
    summary: 'Delete period package item',
    description:
      'Remove a package item from the period. Only periods in DRAFT, RECIPIENTS_IMPORTED, or PACKAGE_DEFINED status can be modified. Archived, INVOICED, and CANCELED periods are read-only.',
  })
  @ApiOkResponse({ description: 'Successfully deleted period package item' })
  removePackageItem(
    @Param('periodId') periodId: string,
    @Param('packageItemId') packageItemId: string,
  ): Promise<void> {
    return this.packageItemsService.remove(periodId, packageItemId);
  }
}
