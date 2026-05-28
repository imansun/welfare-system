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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeriodPackageItem = void 0;
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const item_entity_1 = require("../items/item.entity");
const distribution_period_entity_1 = require("./distribution-period.entity");
let PeriodPackageItem = class PeriodPackageItem {
    id;
    period;
    item;
    quantity;
    note;
    createdAt;
    updatedAt;
};
exports.PeriodPackageItem = PeriodPackageItem;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PeriodPackageItem.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => distribution_period_entity_1.DistributionPeriod }),
    (0, typeorm_1.ManyToOne)(() => distribution_period_entity_1.DistributionPeriod, (period) => period.packageItems, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", distribution_period_entity_1.DistributionPeriod)
], PeriodPackageItem.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => item_entity_1.Item }),
    (0, typeorm_1.ManyToOne)(() => item_entity_1.Item, (item) => item.periodItems, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", item_entity_1.Item)
], PeriodPackageItem.prototype, "item", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)('decimal', { precision: 18, scale: 3 }),
    __metadata("design:type", String)
], PeriodPackageItem.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PeriodPackageItem.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PeriodPackageItem.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PeriodPackageItem.prototype, "updatedAt", void 0);
exports.PeriodPackageItem = PeriodPackageItem = __decorate([
    (0, typeorm_1.Entity)('period_package_items'),
    (0, typeorm_1.Unique)(['period', 'item'])
], PeriodPackageItem);
//# sourceMappingURL=period-package-item.entity.js.map