import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(_dto: RegisterDto) {
    // Public müşteri kayıt akışı kapatıldı; müşteri tarafı girişsiz şikayet oluşturur.
    throw new ForbiddenException(
      'Müşteri kaydı kapatıldı. Lütfen şikayet formunu kullanın.',
    );
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email, isActive: true },
      select: [
        'id',
        'email',
        'password',
        'name',
        'surname',
        'role',
        'departmentId',
        'cityId',
      ],
    });
    if (!user) throw new UnauthorizedException('Geçersiz e-posta veya şifre.');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Geçersiz e-posta veya şifre.');

    if (user.role === UserRole.CUSTOMER) {
      throw new ForbiddenException(
        'Müşteri girişi kapatıldı. Lütfen şikayet formunu kullanın.',
      );
    }

    return this.generateTokens(user);
  }

  async refresh(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.config.get('jwt.refreshSecret'),
      });
      const user = await this.userRepo.findOne({
        where: { id: payload.sub, isActive: true },
      });
      if (!user) throw new UnauthorizedException();
      if (user.role === UserRole.CUSTOMER) {
        throw new ForbiddenException('Müşteri oturum yenileme kapatıldı.');
      }
      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new UnauthorizedException(
        'Geçersiz veya süresi dolmuş refresh token.',
      );
    }
  }

  private generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('jwt.secret'),
      expiresIn: this.config.get('jwt.expiresIn'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('jwt.refreshSecret'),
      expiresIn: this.config.get('jwt.refreshExpiresIn'),
    });

    const { password: _p, ...userWithoutPassword } = user as any;
    return { accessToken, refreshToken, user: userWithoutPassword };
  }
}
