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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const distribution_period_entity_1 = require("../periods/distribution-period.entity");
const distribution_period_status_enum_1 = require("../periods/distribution-period-status.enum");
const period_package_item_entity_1 = require("../periods/period-package-item.entity");
const period_recipient_entity_1 = require("../periods/period-recipient.entity");
const period_recipient_status_enum_1 = require("../periods/period-recipient-status.enum");
const invoice_item_entity_1 = require("./invoice-item.entity");
const invoice_entity_1 = require("./invoice.entity");
let InvoicesService = class InvoicesService {
    invoicesRepository;
    invoiceItemsRepository;
    periodsRepository;
    recipientsRepository;
    packageItemsRepository;
    constructor(invoicesRepository, invoiceItemsRepository, periodsRepository, recipientsRepository, packageItemsRepository) {
        this.invoicesRepository = invoicesRepository;
        this.invoiceItemsRepository = invoiceItemsRepository;
        this.periodsRepository = periodsRepository;
        this.recipientsRepository = recipientsRepository;
        this.packageItemsRepository = packageItemsRepository;
    }
    findAll() {
        return this.invoicesRepository.find({
            relations: { period: true, employee: true, items: true },
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const invoice = await this.invoicesRepository.findOne({
            where: { id },
            relations: { period: true, employee: true, items: true },
        });
        if (!invoice) {
            throw new common_1.NotFoundException('Invoice not found');
        }
        return invoice;
    }
    findByPeriod(periodId) {
        return this.invoicesRepository.find({
            where: { period: { id: periodId } },
            relations: { employee: true, items: true },
            order: { createdAt: 'DESC' },
        });
    }
    async generateForPeriod(periodId) {
        const period = await this.getInvoiceablePeriod(periodId);
        const packageItems = await this.getPackageItems(period.id);
        const recipients = await this.getActiveRecipients(period.id);
        if (packageItems.length === 0) {
            throw new common_1.BadRequestException('Period package is empty');
        }
        if (recipients.length === 0) {
            throw new common_1.BadRequestException('Period has no active recipients');
        }
        let generated = 0;
        let skipped = 0;
        for (const recipient of recipients) {
            const existingInvoice = await this.invoicesRepository.findOne({
                where: {
                    period: { id: period.id },
                    employee: { id: recipient.employee.id },
                },
            });
            if (existingInvoice) {
                skipped++;
                continue;
            }
            await this.createInvoice(period, recipient, packageItems);
            generated++;
        }
        if (generated === 0 && skipped > 0) {
            throw new common_1.ConflictException('All active recipients already have invoices');
        }
        period.status = distribution_period_status_enum_1.DistributionPeriodStatus.INVOICED;
        await this.periodsRepository.save(period);
        return {
            periodId,
            generated,
            skipped,
        };
    }
    async createInvoice(period, recipient, packageItems) {
        const employee = recipient.employee;
        const invoice = this.invoicesRepository.create({
            period,
            employee,
            invoiceNumber: this.createInvoiceNumber(period, employee.personnelCode),
            issuedAt: new Date(),
            employeeName: employee.fullName,
            personnelCode: employee.personnelCode,
            companyName: employee.company?.name ?? null,
            periodTitle: period.title,
            periodCode: period.code,
            totalItems: packageItems.length,
        });
        const savedInvoice = await this.invoicesRepository.save(invoice);
        const invoiceItems = packageItems.map((packageItem) => this.invoiceItemsRepository.create({
            invoice: savedInvoice,
            itemName: packageItem.item.name,
            unitName: packageItem.item.unit?.name ?? null,
            quantity: packageItem.quantity,
        }));
        savedInvoice.items = await this.invoiceItemsRepository.save(invoiceItems);
        return savedInvoice;
    }
    async getInvoiceablePeriod(periodId) {
        const period = await this.periodsRepository.findOne({
            where: { id: periodId },
        });
        if (!period) {
            throw new common_1.NotFoundException('Distribution period not found');
        }
        if (period.status === distribution_period_status_enum_1.DistributionPeriodStatus.ARCHIVED) {
            throw new common_1.BadRequestException('Archived period is read-only');
        }
        if (period.status === distribution_period_status_enum_1.DistributionPeriodStatus.CANCELED) {
            throw new common_1.BadRequestException('Canceled period cannot be invoiced');
        }
        if (period.status === distribution_period_status_enum_1.DistributionPeriodStatus.INVOICED) {
            throw new common_1.ConflictException('Period already invoiced');
        }
        return period;
    }
    getPackageItems(periodId) {
        return this.packageItemsRepository.find({
            where: { period: { id: periodId } },
            relations: { item: { unit: true } },
            order: { createdAt: 'ASC' },
        });
    }
    getActiveRecipients(periodId) {
        return this.recipientsRepository.find({
            where: {
                period: { id: periodId },
                status: period_recipient_status_enum_1.PeriodRecipientStatus.ACTIVE,
            },
            relations: { employee: { company: true } },
            order: { createdAt: 'ASC' },
        });
    }
    createInvoiceNumber(period, personnelCode) {
        return `${period.code}-${personnelCode}`;
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(1, (0, typeorm_1.InjectRepository)(invoice_item_entity_1.InvoiceItem)),
    __param(2, (0, typeorm_1.InjectRepository)(distribution_period_entity_1.DistributionPeriod)),
    __param(3, (0, typeorm_1.InjectRepository)(period_recipient_entity_1.PeriodRecipient)),
    __param(4, (0, typeorm_1.InjectRepository)(period_package_item_entity_1.PeriodPackageItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map