import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Unit } from './unit.entity';
import { UnitsService } from './units.service';
export declare class UnitsController {
    private readonly unitsService;
    constructor(unitsService: UnitsService);
    create(createUnitDto: CreateUnitDto): Promise<Unit>;
    findAll(): Promise<Unit[]>;
    findOne(id: string): Promise<Unit>;
    update(id: string, updateUnitDto: UpdateUnitDto): Promise<Unit>;
    remove(id: string): Promise<void>;
}
