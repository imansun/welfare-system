import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DistributionPeriod } from '../periods/distribution-period.entity';
import { DistributionPeriodStatus } from '../periods/distribution-period-status.enum';
import { PeriodPackageItem } from '../periods/period-package-item.entity';
import { PeriodRecipient } from '../periods/period-recipient.entity';
import { PeriodRecipientStatus } from '../periods/period-recipient-status.enum';
import { GenerateInvoicesResultDto } from './dto/generate-invoices-result.dto';
import { InvoiceItem } from './invoice-item.entity';
import { Invoice } from './invoice.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoicesRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemsRepository: Repository<InvoiceItem>,
    @InjectRepository(DistributionPeriod)
    private readonly periodsRepository: Repository<DistributionPeriod>,
    @InjectRepository(PeriodRecipient)
    private readonly recipientsRepository: Repository<PeriodRecipient>,
    @InjectRepository(PeriodPackageItem)
    private readonly packageItemsRepository: Repository<PeriodPackageItem>,
  ) {}

  findAll(): Promise<Invoice[]> {
    return this.invoicesRepository.find({
      relations: { period: true, employee: true, items: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoicesRepository.findOne({
      where: { id },
      relations: { period: true, employee: true, items: true },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  findByPeriod(periodId: string): Promise<Invoice[]> {
    return this.invoicesRepository.find({
      where: { period: { id: periodId } },
      relations: { employee: true, items: true },
      order: { createdAt: 'DESC' },
    });
  }

  async generateForPeriod(periodId: string): Promise<GenerateInvoicesResultDto> {
    const period = await this.getInvoiceablePeriod(periodId);
    const packageItems = await this.getPackageItems(period.id);
    const recipients = await this.getActiveRecipients(period.id);

    if (packageItems.length === 0) {
      throw new BadRequestException('Period package is empty');
    }

    if (recipients.length === 0) {
      throw new BadRequestException('Period has no active recipients');
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
      throw new ConflictException('All active recipients already have invoices');
    }

    period.status = DistributionPeriodStatus.INVOICED;
    await this.periodsRepository.save(period);

    return {
      periodId,
      generated,
      skipped,
    };
  }

  private async createInvoice(
    period: DistributionPeriod,
    recipient: PeriodRecipient,
    packageItems: PeriodPackageItem[],
  ): Promise<Invoice> {
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

    const invoiceItems = packageItems.map((packageItem) =>
      this.invoiceItemsRepository.create({
        invoice: savedInvoice,
        itemName: packageItem.item.name,
        unitName: packageItem.item.unit?.name ?? null,
        quantity: packageItem.quantity,
      }),
    );

    savedInvoice.items = await this.invoiceItemsRepository.save(invoiceItems);
    return savedInvoice;
  }

  private async getInvoiceablePeriod(
    periodId: string,
  ): Promise<DistributionPeriod> {
    const period = await this.periodsRepository.findOne({
      where: { id: periodId },
    });

    if (!period) {
      throw new NotFoundException('Distribution period not found');
    }

    if (period.status === DistributionPeriodStatus.ARCHIVED) {
      throw new BadRequestException('Archived period is read-only');
    }

    if (period.status === DistributionPeriodStatus.CANCELED) {
      throw new BadRequestException('Canceled period cannot be invoiced');
    }

    if (period.status === DistributionPeriodStatus.INVOICED) {
      throw new ConflictException('Period already invoiced');
    }

    return period;
  }

  private getPackageItems(periodId: string): Promise<PeriodPackageItem[]> {
    return this.packageItemsRepository.find({
      where: { period: { id: periodId } },
      relations: { item: { unit: true } },
      order: { createdAt: 'ASC' },
    });
  }

  private getActiveRecipients(periodId: string): Promise<PeriodRecipient[]> {
    return this.recipientsRepository.find({
      where: {
        period: { id: periodId },
        status: PeriodRecipientStatus.ACTIVE,
      },
      relations: { employee: { company: true } },
      order: { createdAt: 'ASC' },
    });
  }

  private createInvoiceNumber(
    period: DistributionPeriod,
    personnelCode: string,
  ): string {
    return `${period.code}-${personnelCode}`;
  }
}
