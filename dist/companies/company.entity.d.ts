import { Employee } from '../employees/employee.entity';
export declare class Company {
    id: string;
    name: string;
    code: string | null;
    isActive: boolean;
    employees: Employee[];
    createdAt: Date;
    updatedAt: Date;
}
