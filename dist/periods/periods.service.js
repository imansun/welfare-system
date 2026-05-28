"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeriodsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const distribution_period_entity_1 = require("./distribution-period.entity");
const distribution_period_status_enum_1 = require("./distribution-period-status.enum");
let PeriodsService = class PeriodsService {
    periodsRepository;
    usersRepository;
    constructor(periodsRepository, usersRepository) {
        this.periodsRepository = periodsRepository;
        this.usersRepository = usersRepository;
    }
    async create(createPeriodDto) {
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
    findAll() {
        return this.periodsRepository.find({
            relations: { createdBy: true },
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const period = await this.periodsRepository.findOne({
            where: { id },
            relations: { createdBy: true },
        });
        if (!period) {
            throw new common_1.NotFoundException('Distribution period not found');
        }
        return period;
    }
    async update(id, updatePeriodDto) {
        const period = await this.findOne(id);
        this.ensureWritable(period);
        if (updatePeriodDto.code && updatePeriodDto.code !== period.code) {
            await this.ensureUniqueCode(updatePeriodDto.code);
        }
        Object.assign(period, updatePeriodDto);
        return this.periodsRepository.save(period);
    }
    async archive(id) {
        const period = await this.findOne(id);
        if (period.status === distribution_period_status_enum_1.DistributionPeriodStatus.ARCHIVED) {
            return period;
        }
        if (period.status === distribution_period_status_enum_1.DistributionPeriodStatus.CANCELED) {
            throw new common_1.BadRequestException('Canceled period cannot be archived');
        }
        period.status = distribution_period_status_enum_1.DistributionPeriodStatus.ARCHIVED;
        period.archivedAt = new Date();
        return this.periodsRepository.save(period);
    }
    async cancel(id) {
        const period = await this.findOne(id);
        this.ensureWritable(period);
        period.status = distribution_period_status_enum_1.DistributionPeriodStatus.CANCELED;
        return this.periodsRepository.save(period);
    }
    async remove(id) {
        const period = await this.findOne(id);
        this.ensureWritable(period);
        await this.periodsRepository.remove(period);
    }
    ensureWritable(period) {
        if (period.status === distribution_period_status_enum_1.DistributionPeriodStatus.ARCHIVED) {
            throw new common_1.BadRequestException('Archived period is read-only');
        }
    }
    async ensureUniqueCode(code) {
        const existingPeriod = await this.periodsRepository.findOne({
            where: { code },
        });
        if (existingPeriod) {
            throw new common_1.ConflictException('Distribution period code already exists');
        }
    }
    async getUser(userId) {
        if (!userId) {
            return null;
        }
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
};
exports.PeriodsService = PeriodsService;
exports.PeriodsService = PeriodsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(distribution_period_entity_1.DistributionPeriod)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PeriodsService);
//# sourceMappingURL=periods.service.js.map