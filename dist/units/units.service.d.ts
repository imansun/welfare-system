import { Repository } from 'typeorm';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Unit } from './unit.entity';
export declare class UnitsService {
    private readonly unitsRepository;
    constructor(unitsRepository: Repository<Unit>);
    create(createUnitDto: CreateUnitDto): Promise<Unit>;
    findAll(): Promise<Unit[]>;
    findOne(id: string): Promise<Unit>;
    update(id: string, updateUnitDto: UpdateUnitDto): Promise<Unit>;
    remove(id: string): Promise<void>;
    private ensureUniqueName;
}
