import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { AuthUser } from './auth-user.interface';
import { JwtPayload } from './jwt-payload.interface';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly usersRepository;
    constructor(configService: ConfigService, usersRepository: Repository<User>);
    validate(payload: JwtPayload): Promise<AuthUser>;
}
export {};
