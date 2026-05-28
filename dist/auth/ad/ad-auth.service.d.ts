import { ConfigService } from '@nestjs/config';
import { AdUser } from './ad-user.interface';
export declare class AdAuthService {
    private readonly configService;
    constructor(configService: ConfigService);
    isEnabled(): boolean;
    validate(username: string, password: string): Promise<AdUser>;
    private findUser;
    private bind;
    private searchUser;
    private mapEntry;
    private getUserBindDn;
    private getAttributes;
    private clientBind;
    private createClient;
}
