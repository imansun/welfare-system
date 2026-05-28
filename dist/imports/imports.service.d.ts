import { Repository } from 'typeorm';
import { Company } from '../companies/company.entity';
import { Employee } from '../employees/employee.entity';
import { DistributionPeriod } from '../periods/distribution-period.entity';
import { PeriodRecipient } from '../periods/period-recipient.entity';
import { ImportRecipientsResultDto } from './dto/import-recipients-result.dto';
export declare class ImportsService {
    private readonly periodsRepository;
    private readonly employeesRepository;
    private readonly companiesRepository;
    private readonly recipientsRepository;
    constructor(periodsRepository: Repository<DistributionPeriod>, employeesRepository: Repository<Employee>, companiesRepository: Repository<Company>, recipientsRepository: Repository<PeriodRecipient>);
    importRecipients(periodId: string, file?: {
        buffer: Buffer;
    }): Promise<ImportRecipientsResultDto>;
    private readRows;
    private getWritablePeriod;
    private upsertEmployee;
    private getCompany;
    private getRecipientStatus;
    private getCell;
    private normalizeKey;
}
