import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from '../units/unit.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Item } from './item.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
    @InjectRepository(Unit)
    private readonly unitsRepository: Repository<Unit>,
  ) {}

  async create(createItemDto: CreateItemDto): Promise<Item> {
    await this.ensureUniqueName(createItemDto.name);

    const item = this.itemsRepository.create({
      name: createItemDto.name,
      isActive: createItemDto.isActive,
      unit: await this.getUnit(createItemDto.unitId),
    });

    return this.itemsRepository.save(item);
  }

  findAll(): Promise<Item[]> {
    return this.itemsRepository.find({
      relations: { unit: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.itemsRepository.findOne({
      where: { id },
      relations: { unit: true },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return item;
  }

  async update(id: string, updateItemDto: UpdateItemDto): Promise<Item> {
    const item = await this.findOne(id);

    if (updateItemDto.name && updateItemDto.name !== item.name) {
      await this.ensureUniqueName(updateItemDto.name);
    }

    if (updateItemDto.name !== undefined) {
      item.name = updateItemDto.name;
    }

    if (updateItemDto.isActive !== undefined) {
      item.isActive = updateItemDto.isActive;
    }

    if (updateItemDto.unitId !== undefined) {
      item.unit = await this.getUnit(updateItemDto.unitId);
    }

    return this.itemsRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.itemsRepository.remove(item);
  }

  private async ensureUniqueName(name: string): Promise<void> {
    const existingItem = await this.itemsRepository.findOne({
      where: { name },
    });

    if (existingItem) {
      throw new ConflictException('Item name already exists');
    }
  }

  private async getUnit(unitId?: string): Promise<Unit | null> {
    if (!unitId) {
      return null;
    }

    const unit = await this.unitsRepository.findOne({
      where: { id: unitId },
    });

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    return unit;
  }
}
