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
exports.PeriodsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_period_dto_1 = require("./dto/create-period.dto");
const create_period_package_item_dto_1 = require("./dto/create-period-package-item.dto");
const update_period_package_item_dto_1 = require("./dto/update-period-package-item.dto");
const update_period_dto_1 = require("./dto/update-period.dto");
const distribution_period_entity_1 = require("./distribution-period.entity");
const period_package_item_entity_1 = require("./period-package-item.entity");
const period_package_items_service_1 = require("./period-package-items.service");
const periods_service_1 = require("./periods.service");
let PeriodsController = class PeriodsController {
    periodsService;
    packageItemsService;
    constructor(periodsService, packageItemsService) {
        this.periodsService = periodsService;
        this.packageItemsService = packageItemsService;
    }
    create(createPeriodDto) {
        return this.periodsService.create(createPeriodDto);
    }
    findAll() {
        return this.periodsService.findAll();
    }
    findOne(id) {
        return this.periodsService.findOne(id);
    }
    update(id, updatePeriodDto) {
        return this.periodsService.update(id, updatePeriodDto);
    }
    archive(id) {
        return this.periodsService.archive(id);
    }
    cancel(id) {
        return this.periodsService.cancel(id);
    }
    remove(id) {
        return this.periodsService.remove(id);
    }
    createPackageItem(periodId, createDto) {
        return this.packageItemsService.create(periodId, createDto);
    }
    findPackageItems(periodId) {
        return this.packageItemsService.findAll(periodId);
    }
    findPackageItem(periodId, packageItemId) {
        return this.packageItemsService.findOne(periodId, packageItemId);
    }
    updatePackageItem(periodId, packageItemId, updateDto) {
        return this.packageItemsService.update(periodId, packageItemId, updateDto);
    }
    removePackageItem(periodId, packageItemId) {
        return this.packageItemsService.remove(periodId, packageItemId);
    }
};
exports.PeriodsController = PeriodsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create distribution period' }),
    (0, swagger_1.ApiCreatedResponse)({ type: distribution_period_entity_1.DistributionPeriod }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_period_dto_1.CreatePeriodDto]),
    __metadata("design:returntype", Promise)
], PeriodsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List distribution periods' }),
    (0, swagger_1.ApiOkResponse)({ type: [distribution_period_entity_1.DistributionPeriod] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PeriodsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get distribution period by id' }),
    (0, swagger_1.ApiOkResponse)({ type: distribution_period_entity_1.DistributionPeriod }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PeriodsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update distribution period' }),
    (0, swagger_1.ApiOkResponse)({ type: distribution_period_entity_1.DistributionPeriod }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_period_dto_1.UpdatePeriodDto]),
    __metadata("design:returntype", Promise)
], PeriodsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/archive'),
    (0, swagger_1.ApiOperation)({ summary: 'Archive distribution period' }),
    (0, swagger_1.ApiCreatedResponse)({ type: distribution_period_entity_1.DistributionPeriod }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PeriodsController.prototype, "archive", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel distribution period' }),
    (0, swagger_1.ApiCreatedResponse)({ type: distribution_period_entity_1.DistributionPeriod }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PeriodsController.prototype, "cancel", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete distribution period' }),
    (0, swagger_1.ApiOkResponse)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PeriodsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':periodId/package-items'),
    (0, swagger_1.ApiOperation)({ summary: 'Create period package item' }),
    (0, swagger_1.ApiCreatedResponse)({ type: period_package_item_entity_1.PeriodPackageItem }),
    __param(0, (0, common_1.Param)('periodId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_period_package_item_dto_1.CreatePeriodPackageItemDto]),
    __metadata("design:returntype", Promise)
], PeriodsController.prototype, "createPackageItem", null);
__decorate([
    (0, common_1.Get)(':periodId/package-items'),
    (0, swagger_1.ApiOperation)({ summary: 'List period package items' }),
    (0, swagger_1.ApiOkResponse)({ type: [period_package_item_entity_1.PeriodPackageItem] }),
    __param(0, (0, common_1.Param)('periodId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PeriodsController.prototype, "findPackageItems", null);
__decorate([
    (0, common_1.Get)(':periodId/package-items/:packageItemId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get period package item by id' }),
    (0, swagger_1.ApiOkResponse)({ type: period_package_item_entity_1.PeriodPackageItem }),
    __param(0, (0, common_1.Param)('periodId')),
    __param(1, (0, common_1.Param)('packageItemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PeriodsController.prototype, "findPackageItem", null);
__decorate([
    (0, common_1.Patch)(':periodId/package-items/:packageItemId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update period package item' }),
    (0, swagger_1.ApiOkResponse)({ type: period_package_item_entity_1.PeriodPackageItem }),
    __param(0, (0, common_1.Param)('periodId')),
    __param(1, (0, common_1.Param)('packageItemId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_period_package_item_dto_1.UpdatePeriodPackageItemDto]),
    __metadata("design:returntype", Promise)
], PeriodsController.prototype, "updatePackageItem", null);
__decorate([
    (0, common_1.Delete)(':periodId/package-items/:packageItemId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete period package item' }),
    (0, swagger_1.ApiOkResponse)(),
    __param(0, (0, common_1.Param)('periodId')),
    __param(1, (0, common_1.Param)('packageItemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PeriodsController.prototype, "removePackageItem", null);
exports.PeriodsController = PeriodsController = __decorate([
    (0, swagger_1.ApiTags)('periods'),
    (0, common_1.Controller)('periods'),
    __metadata("design:paramtypes", [periods_service_1.PeriodsService,
        period_package_items_service_1.PeriodPackageItemsService])
], PeriodsController);
//# sourceMappingURL=periods.controller.js.map