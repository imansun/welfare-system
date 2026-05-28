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
exports.PeriodRecipient = void 0;
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("../employees/employee.entity");
const distribution_period_entity_1 = require("./distribution-period.entity");
const period_recipient_status_enum_1 = require("./period-recipient-status.enum");
let PeriodRecipient = class PeriodRecipient {
    id;
    period;
    employee;
    status;
    note;
    createdAt;
    updatedAt;
};
exports.PeriodRecipient = PeriodRecipient;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PeriodRecipient.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => distribution_period_entity_1.DistributionPeriod }),
    (0, typeorm_1.ManyToOne)(() => distribution_period_entity_1.DistributionPeriod, (period) => period.recipients, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", distribution_period_entity_1.DistributionPeriod)
], PeriodRecipient.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => employee_entity_1.Employee }),
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, (employee) => employee.recipients, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", employee_entity_1.Employee)
], PeriodRecipient.prototype, "employee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: period_recipient_status_enum_1.PeriodRecipientStatus }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: period_recipient_status_enum_1.PeriodRecipientStatus,
        default: period_recipient_status_enum_1.PeriodRecipientStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], PeriodRecipient.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PeriodRecipient.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PeriodRecipient.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PeriodRecipient.prototype, "updatedAt", void 0);
exports.PeriodRecipient = PeriodRecipient = __decorate([
    (0, typeorm_1.Entity)('period_recipients'),
    (0, typeorm_1.Unique)(['period', 'employee'])
], PeriodRecipient);
//# sourceMappingURL=period-recipient.entity.js.map