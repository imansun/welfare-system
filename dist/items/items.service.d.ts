import { Repository } from 'typeorm';
import { Unit } from '../units/unit.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Item } from './item.entity';
export declare class ItemsService {
    private readonly itemsRepository;
    private readonly unitsRepository;
    constructor(itemsRepository: Repository<Item>, unitsRepository: Repository<Unit>);
    create(createItemDto: CreateItemDto): Promise<Item>;
    findAll(): Promise<Item[]>;
    findOne(id: string): Promise<Item>;
    update(id: string, updateItemDto: UpdateItemDto): Promise<Item>;
    remove(id: string): Promise<void>;
    private ensureUniqueName;
    private getUnit;
}
