import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { CreatePeriodDto } from './dto/create-period.dto';
import { UpdatePeriodDto } from './dto/update-period.dto';
import { DistributionPeriod } from './distribution-period.entity';
export declare class PeriodsService {
    private readonly periodsRepository;
    private readonly usersRepository;
    constructor(periodsRepository: Repository<DistributionPeriod>, usersRepository: Repository<User>);
    create(createPeriodDto: CreatePeriodDto): Promise<DistributionPeriod>;
    findAll(): Promise<DistributionPeriod[]>;
    findOne(id: string): Promise<DistributionPeriod>;
    update(id: string, updatePeriodDto: UpdatePeriodDto): Promise<DistributionPeriod>;
    archive(id: string): Promise<DistributionPeriod>;
    cancel(id: string): Promise<DistributionPeriod>;
    remove(id: string): Promise<void>;
    ensureWritable(period: DistributionPeriod): void;
    private ensureUniqueCode;
    private getUser;
}
