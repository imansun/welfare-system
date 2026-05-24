import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { UserRole } from '../users/user-role.enum';
import { AdAuthService } from './ad/ad-auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly adAuthService: AdAuthService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    if (!loginDto.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = this.adAuthService.isEnabled()
      ? await this.loginWithAd(loginDto)
      : await this.loginLocally(loginDto);

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    user.lastLoginAt = new Date();
    await this.usersRepository.save(user);

    const payload: JwtPayload & object = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1d') as any,
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

  private async loginWithAd(loginDto: LoginDto): Promise<User> {
    const adUser = await this.adAuthService.validate(
      loginDto.username,
      loginDto.password,
    );

    let user = await this.usersRepository.findOne({
      where: { username: adUser.username },
    });

    if (!user) {
      user = this.usersRepository.create({
        username: adUser.username,
        displayName: adUser.displayName,
        email: adUser.email,
        adDn: adUser.dn,
        role: UserRole.VIEWER,
        isActive: true,
      });
    }

    user.displayName = adUser.displayName;
    user.email = adUser.email;
    user.adDn = adUser.dn;

    return this.usersRepository.save(user);
  }

  private async loginLocally(loginDto: LoginDto): Promise<User> {
    let user = await this.usersRepository.findOne({
      where: { username: loginDto.username },
    });

    if (!user) {
      user = this.usersRepository.create({
        username: loginDto.username,
        displayName: loginDto.username,
        role: UserRole.ADMIN,
        isActive: true,
      });
    }

    return this.usersRepository.save(user);
  }
}
