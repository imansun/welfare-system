import { Request } from 'express';
import type { AuthUser } from './auth-user.interface';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
type AuthenticatedRequest = Request & {
    user: AuthUser;
};
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    me(request: AuthenticatedRequest): AuthUser;
}
export {};
