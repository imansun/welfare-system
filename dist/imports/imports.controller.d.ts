import { ImportRecipientsResultDto } from './dto/import-recipients-result.dto';
import { ImportsService } from './imports.service';
export declare class ImportsController {
    private readonly importsService;
    constructor(importsService: ImportsService);
    importRecipients(periodId: string, file: {
        buffer: Buffer;
    }): Promise<ImportRecipientsResultDto>;
}
