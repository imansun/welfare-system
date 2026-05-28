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
exports.DistributionPeriod = void 0;
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const invoice_entity_1 = require("../invoices/invoice.entity");
const user_entity_1 = require("../users/user.entity");
const distribution_period_status_enum_1 = require("./distribution-period-status.enum");
const period_package_item_entity_1 = require("./period-package-item.entity");
const period_recipient_entity_1 = require("./period-recipient.entity");
let DistributionPeriod = class DistributionPeriod {
    id;
    code;
    title;
    year;
    month;
    status;
    description;
    archivedAt;
    createdBy;
    recipients;
    packageItems;
    invoices;
    createdAt;
    updatedAt;
};
exports.DistributionPeriod = DistributionPeriod;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DistributionPeriod.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], DistributionPeriod.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DistributionPeriod.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], DistributionPeriod.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], DistributionPeriod.prototype, "month", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: distribution_period_status_enum_1.DistributionPeriodStatus }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: distribution_period_status_enum_1.DistributionPeriodStatus,
        default: distribution_period_status_enum_1.DistributionPeriodStatus.DRAFT,
    }),
    __metadata("design:type", String)
], DistributionPeriod.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], DistributionPeriod.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], DistributionPeriod.prototype, "archivedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: () => user_entity_1.User, nullable: true }),
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.createdPeriods, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    __metadata("design:type", Object)
], DistributionPeriod.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => period_recipient_entity_1.PeriodRecipient, (recipient) => recipient.period),
    __metadata("design:type", Array)
], DistributionPeriod.prototype, "recipients", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => period_package_item_entity_1.PeriodPackageItem, (packageItem) => packageItem.period),
    __metadata("design:type", Array)
], DistributionPeriod.prototype, "packageItems", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => invoice_entity_1.Invoice, (invoice) => invoice.period),
    __metadata("design:type", Array)
], DistributionPeriod.prototype, "invoices", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DistributionPeriod.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], DistributionPeriod.prototype, "updatedAt", void 0);
exports.DistributionPeriod = DistributionPeriod = __decorate([
    (0, typeorm_1.Entity)('distribution_periods')
], DistributionPeriod);
//# sourceMappingURL=distribution-period.entity.js.map