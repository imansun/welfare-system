import { ExtractedEmployeeData } from '../interfaces/extracted-employee-data.interface';
export interface ExtractedSalaryReceiptData {
    employees: ExtractedEmployeeData[];
}
export declare class SalaryReceiptExtractorService {
    private readonly logger;
    extract(xmlJson: any): ExtractedSalaryReceiptData;
    private findEmployeeNodes;
    private hasEmployeeIdentity;
    private removeDuplicateEmployeeNodes;
    private mapEmployee;
    private extractLoans;
    private extractDeductions;
    private extractPayments;
    private extractAttendance;
    private getDetails4;
    private toArray;
    private pickFirst;
    private getDirectValue;
    private getValue;
    private normalizeValue;
}
