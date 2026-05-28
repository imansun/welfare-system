"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const user_role_enum_1 = require("../users/user-role.enum");
const ad_auth_service_1 = require("./ad/ad-auth.service");
let AuthService = class AuthService {
    jwtService;
    configService;
    adAuthService;
    usersRepository;
    constructor(jwtService, configService, adAuthService, usersRepository) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.adAuthService = adAuthService;
        this.usersRepository = usersRepository;
    }
    async login(loginDto) {
        if (!loginDto.password) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const user = this.adAuthService.isEnabled()
            ? await this.loginWithAd(loginDto)
            : await this.loginLocally(loginDto);
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('User is inactive');
        }
        user.lastLoginAt = new Date();
        await this.usersRepository.save(user);
        const payload = {
            sub: user.id,
            username: user.username,
            role: user.role,
        };
        return {
            accessToken: await this.jwtService.signAsync(payload, {
                expiresIn: this.configService.get('JWT_EXPIRES_IN', '1d'),
            }),
            user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                email: user.email,
                role: user.role,
            },
        };
    }
    async loginWithAd(loginDto) {
        const adUser = await this.adAuthService.validate(loginDto.username, loginDto.password);
        let user = await this.usersRepository.findOne({
            where: { username: adUser.username },
        });
        if (!user) {
            user = this.usersRepository.create({
                username: adUser.username,
                displayName: adUser.displayName,
                email: adUser.email,
                adDn: adUser.dn,
                role: user_role_enum_1.UserRole.VIEWER,
                isActive: true,
            });
        }
        user.displayName = adUser.displayName;
        user.email = adUser.email;
        user.adDn = adUser.dn;
        return this.usersRepository.save(user);
    }
    async loginLocally(loginDto) {
        let user = await this.usersRepository.findOne({
            where: { username: loginDto.username },
        });
        if (!user) {
            user = this.usersRepository.create({
                username: loginDto.username,
                displayName: loginDto.username,
                role: user_role_enum_1.UserRole.ADMIN,
                isActive: true,
            });
        }
        return this.usersRepository.save(user);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        ad_auth_service_1.AdAuthService,
        typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map