import { ExtractedEmployeeData } from '../interfaces/extracted-employee-data.interface';
export declare class ExcelReportService {
    generate(employees: ExtractedEmployeeData[], fields: string[]): Promise<Buffer>;
    private flattenEmployee;
    private resolveField;
    private getFieldTitle;
}
