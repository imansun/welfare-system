import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { AdAuthService } from './ad/ad-auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly jwtService;
    private readonly configService;
    private readonly adAuthService;
    private readonly usersRepository;
    constructor(jwtService: JwtService, configService: ConfigService, adAuthService: AdAuthService, usersRepository: Repository<User>);
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    private loginWithAd;
    private loginLocally;
}
