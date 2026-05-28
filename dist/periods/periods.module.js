"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeriodsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const item_entity_1 = require("../items/item.entity");
const user_entity_1 = require("../users/user.entity");
const distribution_period_entity_1 = require("./distribution-period.entity");
const period_package_item_entity_1 = require("./period-package-item.entity");
const period_package_items_service_1 = require("./period-package-items.service");
const periods_controller_1 = require("./periods.controller");
const periods_service_1 = require("./periods.service");
let PeriodsModule = class PeriodsModule {
};
exports.PeriodsModule = PeriodsModule;
exports.PeriodsModule = PeriodsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([distribution_period_entity_1.DistributionPeriod, user_entity_1.User, period_package_item_entity_1.PeriodPackageItem, item_entity_1.Item]),
        ],
        controllers: [periods_controller_1.PeriodsController],
        providers: [periods_service_1.PeriodsService, period_package_items_service_1.PeriodPackageItemsService],
        exports: [periods_service_1.PeriodsService, period_package_items_service_1.PeriodPackageItemsService],
    })
], PeriodsModule);
//# sourceMappingURL=periods.module.js.map