import { UserRole } from '../../users/user-role.enum';
export declare class AuthResponseDto {
    accessToken: string;
    user: {
        id: string;
        username: string;
        displayName: string;
        email: string | null;
        role: UserRole;
    };
}
