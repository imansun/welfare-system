import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../items/item.entity';
import { CreatePeriodPackageItemDto } from './dto/create-period-package-item.dto';
import { UpdatePeriodPackageItemDto } from './dto/update-period-package-item.dto';
import { DistributionPeriod } from './distribution-period.entity';
import { DistributionPeriodStatus } from './distribution-period-status.enum';
import { PeriodPackageItem } from './period-package-item.entity';

@Injectable()
export class PeriodPackageItemsService {
  constructor(
    @InjectRepository(PeriodPackageItem)
    private readonly packageItemsRepository: Repository<PeriodPackageItem>,
    @InjectRepository(DistributionPeriod)
    private readonly periodsRepository: Repository<DistributionPeriod>,
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  async create(
    periodId: string,
    createDto: CreatePeriodPackageItemDto,
  ): Promise<PeriodPackageItem> {
    const period = await this.getWritablePeriod(periodId);
    const item = await this.getItem(createDto.itemId);

    const existingPackageItem = await this.packageItemsRepository.findOne({
      where: {
        period: { id: period.id },
        item: { id: item.id },
      },
    });

    if (existingPackageItem) {
      throw new ConflictException('Item already exists in this period package');
    }

    const packageItem = this.packageItemsRepository.create({
      period,
      item,
      quantity: createDto.quantity,
      price: createDto.price,
      note: createDto.note,
    });

    const savedPackageItem = await this.packageItemsRepository.save(packageItem);

    if (
      period.status === DistributionPeriodStatus.DRAFT ||
      period.status === DistributionPeriodStatus.RECIPIENTS_IMPORTED
    ) {
      period.status = DistributionPeriodStatus.PACKAGE_DEFINED;
      await this.periodsRepository.save(period);
    }

    return this.findOne(period.id, savedPackageItem.id);
  }

  findAll(periodId: string): Promise<PeriodPackageItem[]> {
    return this.packageItemsRepository.find({
      where: { period: { id: periodId } },
      relations: { item: { unit: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(
    periodId: string,
    packageItemId: string,
  ): Promise<PeriodPackageItem> {
    const packageItem = await this.packageItemsRepository.findOne({
      where: {
        id: packageItemId,
        period: { id: periodId },
      },
      relations: { item: { unit: true } },
    });

    if (!packageItem) {
      throw new NotFoundException('Period package item not found');
    }

    return packageItem;
  }

  async update(
    periodId: string,
    packageItemId: string,
    updateDto: UpdatePeriodPackageItemDto,
  ): Promise<PeriodPackageItem> {
    const period = await this.getWritablePeriod(periodId);
    const packageItem = await this.findOne(period.id, packageItemId);

    Object.assign(packageItem, updateDto);
    await this.packageItemsRepository.save(packageItem);

    return this.findOne(period.id, packageItem.id);
  }

  async remove(periodId: string, packageItemId: string): Promise<void> {
    const period = await this.getWritablePeriod(periodId);
    const packageItem = await this.findOne(period.id, packageItemId);

    await this.packageItemsRepository.remove(packageItem);
  }

  private async getWritablePeriod(
    periodId: string,
  ): Promise<DistributionPeriod> {
    const period = await this.periodsRepository.findOne({
      where: { id: periodId },
    });

    if (!period) {
      throw new NotFoundException('Distribution period not found');
    }

    if (period.status === DistributionPeriodStatus.ARCHIVED) {
      throw new BadRequestException('Archived period is read-only');
    }

    if (
      period.status === DistributionPeriodStatus.INVOICED ||
      period.status === DistributionPeriodStatus.CANCELED
    ) {
      throw new BadRequestException('Period package cannot be changed now');
    }

    return period;
  }

  private async getItem(itemId: string): Promise<Item> {
    const item = await this.itemsRepository.findOne({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return item;
  }
}
