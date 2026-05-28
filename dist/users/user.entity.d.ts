import { DistributionPeriod } from '../periods/distribution-period.entity';
import { UserRole } from './user-role.enum';
export declare class User {
    id: string;
    username: string;
    displayName: string;
    email: string | null;
    adDn: string | null;
    role: UserRole;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdPeriods: DistributionPeriod[];
    createdAt: Date;
    updatedAt: Date;
}
