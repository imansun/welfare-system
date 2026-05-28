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
exports.PeriodPackageItemsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const item_entity_1 = require("../items/item.entity");
const distribution_period_entity_1 = require("./distribution-period.entity");
const distribution_period_status_enum_1 = require("./distribution-period-status.enum");
const period_package_item_entity_1 = require("./period-package-item.entity");
let PeriodPackageItemsService = class PeriodPackageItemsService {
    packageItemsRepository;
    periodsRepository;
    itemsRepository;
    constructor(packageItemsRepository, periodsRepository, itemsRepository) {
        this.packageItemsRepository = packageItemsRepository;
        this.periodsRepository = periodsRepository;
        this.itemsRepository = itemsRepository;
    }
    async create(periodId, createDto) {
        const period = await this.getWritablePeriod(periodId);
        const item = await this.getItem(createDto.itemId);
        const existingPackageItem = await this.packageItemsRepository.findOne({
            where: {
                period: { id: period.id },
                item: { id: item.id },
            },
        });
        if (existingPackageItem) {
            throw new common_1.ConflictException('Item already exists in this period package');
        }
        const packageItem = this.packageItemsRepository.create({
            period,
            item,
            quantity: createDto.quantity,
            note: createDto.note,
        });
        const savedPackageItem = await this.packageItemsRepository.save(packageItem);
        if (period.status === distribution_period_status_enum_1.DistributionPeriodStatus.DRAFT ||
            period.status === distribution_period_status_enum_1.DistributionPeriodStatus.RECIPIENTS_IMPORTED) {
            period.status = distribution_period_status_enum_1.DistributionPeriodStatus.PACKAGE_DEFINED;
            await this.periodsRepository.save(period);
        }
        return this.findOne(period.id, savedPackageItem.id);
    }
    findAll(periodId) {
        return this.packageItemsRepository.find({
            where: { period: { id: periodId } },
            relations: { item: { unit: true } },
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(periodId, packageItemId) {
        const packageItem = await this.packageItemsRepository.findOne({
            where: {
                id: packageItemId,
                period: { id: periodId },
            },
            relations: { item: { unit: true } },
        });
        if (!packageItem) {
            throw new common_1.NotFoundException('Period package item not found');
        }
        return packageItem;
    }
    async update(periodId, packageItemId, updateDto) {
        const period = await this.getWritablePeriod(periodId);
        const packageItem = await this.findOne(period.id, packageItemId);
        Object.assign(packageItem, updateDto);
        await this.packageItemsRepository.save(packageItem);
        return this.findOne(period.id, packageItem.id);
    }
    async remove(periodId, packageItemId) {
        const period = await this.getWritablePeriod(periodId);
        const packageItem = await this.findOne(period.id, packageItemId);
        await this.packageItemsRepository.remove(packageItem);
    }
    async getWritablePeriod(periodId) {
        const period = await this.periodsRepository.findOne({
            where: { id: periodId },
        });
        if (!period) {
            throw new common_1.NotFoundException('Distribution period not found');
        }
        if (period.status === distribution_period_status_enum_1.DistributionPeriodStatus.ARCHIVED) {
            throw new common_1.BadRequestException('Archived period is read-only');
        }
        if (period.status === distribution_period_status_enum_1.DistributionPeriodStatus.INVOICED ||
            period.status === distribution_period_status_enum_1.DistributionPeriodStatus.CANCELED) {
            throw new common_1.BadRequestException('Period package cannot be changed now');
        }
        return period;
    }
    async getItem(itemId) {
        const item = await this.itemsRepository.findOne({
            where: { id: itemId },
        });
        if (!item) {
            throw new common_1.NotFoundException('Item not found');
        }
        return item;
    }
};
exports.PeriodPackageItemsService = PeriodPackageItemsService;
exports.PeriodPackageItemsService = PeriodPackageItemsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(period_package_item_entity_1.PeriodPackageItem)),
    __param(1, (0, typeorm_1.InjectRepository)(distribution_period_entity_1.DistributionPeriod)),
    __param(2, (0, typeorm_1.InjectRepository)(item_entity_1.Item)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PeriodPackageItemsService);
//# sourceMappingURL=period-package-items.service.js.map