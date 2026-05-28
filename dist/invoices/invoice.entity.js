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
exports.Invoice = void 0;
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("../employees/employee.entity");
const distribution_period_entity_1 = require("../periods/distribution-period.entity");
const invoice_item_entity_1 = require("./invoice-item.entity");
let Invoice = class Invoice {
    id;
    period;
    employee;
    invoiceNumber;
    issuedAt;
    employeeName;
    personnelCode;
    companyName;
    periodTitle;
    periodCode;
    totalItems;
    items;
    createdAt;
    updatedAt;
};
exports.Invoice = Invoice;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Invoice.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => distribution_period_entity_1.DistributionPeriod }),
    (0, typeorm_1.ManyToOne)(() => distribution_period_entity_1.DistributionPeriod, (period) => period.invoices, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", distribution_period_entity_1.DistributionPeriod)
], Invoice.prototype, "period", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => employee_entity_1.Employee }),
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, (employee) => employee.invoices, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", employee_entity_1.Employee)
], Invoice.prototype, "employee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Invoice.prototype, "invoiceNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Invoice.prototype, "issuedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Invoice.prototype, "employeeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Invoice.prototype, "personnelCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Invoice.prototype, "companyName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Invoice.prototype, "periodTitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Invoice.prototype, "periodCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Invoice.prototype, "totalItems", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => [invoice_item_entity_1.InvoiceItem] }),
    (0, typeorm_1.OneToMany)(() => invoice_item_entity_1.InvoiceItem, (item) => item.invoice, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Invoice.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Invoice.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Invoice.prototype, "updatedAt", void 0);
exports.Invoice = Invoice = __decorate([
    (0, typeorm_1.Entity)('invoices'),
    (0, typeorm_1.Unique)(['period', 'employee'])
], Invoice);
//# sourceMappingURL=invoice.entity.js.map