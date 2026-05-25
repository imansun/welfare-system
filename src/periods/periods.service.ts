import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { CreatePeriodDto } from './dto/create-period.dto';
import { UpdatePeriodDto } from './dto/update-period.dto';
import { DistributionPeriod } from './distribution-period.entity';
import { DistributionPeriodStatus } from './distribution-period-status.enum';

@Injectable()
export class PeriodsService {
  constructor(
    @InjectRepository(DistributionPeriod)
    private readonly periodsRepository: Repository<DistributionPeriod>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createPeriodDto: CreatePeriodDto): Promise<DistributionPeriod> {
    await this.ensureUniqueCode(createPeriodDto.code);

    const period = this.periodsRepository.create({
      code: createPeriodDto.code,
      title: createPeriodDto.title,
      year: createPeriodDto.year,
      month: createPeriodDto.month,
      description: createPeriodDto.description,
      createdBy: await this.getUser(createPeriodDto.createdById),
    });

    return this.periodsRepository.save(period);
  }

  findAll(): Promise<DistributionPeriod[]> {
    return this.periodsRepository.find({
      relations: { createdBy: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<DistributionPeriod> {
    const period = await this.periodsRepository.findOne({
      where: { id },
      relations: { createdBy: true },
    });

    if (!period) {
      throw new NotFoundException('Distribution period not found');
    }

    return period;
  }

  async update(
    id: string,
    updatePeriodDto: UpdatePeriodDto,
  ): Promise<DistributionPeriod> {
    const period = await this.findOne(id);
    this.ensureWritable(period);

    if (updatePeriodDto.code && updatePeriodDto.code !== period.code) {
      await this.ensureUniqueCode(updatePeriodDto.code);
    }

    Object.assign(period, updatePeriodDto);
    return this.periodsRepository.save(period);
  }

  async archive(id: string): Promise<DistributionPeriod> {
    const period = await this.findOne(id);

    if (period.status === DistributionPeriodStatus.ARCHIVED) {
      return period;
    }

    if (period.status === DistributionPeriodStatus.CANCELED) {
      throw new BadRequestException('Canceled period cannot be archived');
    }

    period.status = DistributionPeriodStatus.ARCHIVED;
    period.archivedAt = new Date();

    return this.periodsRepository.save(period);
  }

  async cancel(id: string): Promise<DistributionPeriod> {
    const period = await this.findOne(id);
    this.ensureWritable(period);

    period.status = DistributionPeriodStatus.CANCELED;
    return this.periodsRepository.save(period);
  }

  async remove(id: string): Promise<void> {
    const period = await this.findOne(id);
    this.ensureWritable(period);

    await this.periodsRepository.remove(period);
  }

  ensureWritable(period: DistributionPeriod): void {
    if (period.status === DistributionPeriodStatus.ARCHIVED) {
      throw new BadRequestException('Archived period is read-only');
    }
  }

  private async ensureUniqueCode(code: string): Promise<void> {
    const existingPeriod = await this.periodsRepository.findOne({
      where: { code },
    });

    if (existingPeriod) {
      throw new ConflictException('Distribution period code already exists');
    }
  }

  private async getUser(userId?: string): Promise<User | null> {
    if (!userId) {
      return null;
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
