import { JwtService } from '@nestjs/jwt';
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from './entity/refresh-token.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken) private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    return null;
  }

  async signup(email: string, password: string) {
    const user = await this.userService.findOneByEmail(email);
    if (user) throw new BadRequestException('유저가 이미 존재합니다!');
    const newUser = await this.userService.create(email, password);
    return newUser;
  }

  async signin(email: string, password: string) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new UnauthorizedException();

    const isMatch = password == user.password;
    if (!isMatch) throw new UnauthorizedException();

    const refreshToken = this.generateRefreshToken(user.id);
    await this.createRefreshTokenUsingUser(user.id, refreshToken);
    return {
      accessToken: this.generateAccessToken(user.id),
      refreshToken,
    };
  }

  // 리프레시 토큰 메서드
  async refresh(token: string, userId: string) {
    // 리프레시 토큰이 DB에 저장되어 있는지 없는지 확인한다.
    // 같은 토큰이 있는지 확인한다.
    const refreshTokenEntity = await this.refreshTokenRepository.findOneBy({ token });
    // 저장되어 있지 않다면 에러 처리 진행
    if (!refreshTokenEntity) throw new BadRequestException();
    // 토큰 재발급
    const accessToken = this.generateAccessToken(userId);
    const refreshToken = this.generateRefreshToken(userId);
    refreshTokenEntity.token = refreshToken;
    // accessToken을 재발급 하는 경우 다시 저장 진행
    // 왜냐하면 재발급 받고 return을 했는데 DB에 저장이 안되면, 에러가 발생한다.
    await this.refreshTokenRepository.save(refreshTokenEntity);
    return { accessToken, refreshToken };
  }

  // 엑세스 토큰 발급 메서드
  private generateAccessToken(userId: string) {
    const payload = { sub: userId, tokenType: 'access' };
    return this.jwtService.sign(payload, { expiresIn: '1d' });
  }

  // 리프레시 토큰 발급 메서드
  private generateRefreshToken(userId: string) {
    const payload = { sub: userId, tokenType: 'refresh' };
    return this.jwtService.sign(payload, { expiresIn: '30d' });
  }

  // 로그인 시 Refresh토큰 확인 및 발급 진행
  private async createRefreshTokenUsingUser(userId: string, refreshToken: string) {
    let refreshTokenEntity = await this.refreshTokenRepository.findOneBy({ user: { id: userId } });
    if (refreshTokenEntity) {
      // DB에 토큰이 있다면 토큰값 입력
      refreshTokenEntity.token = refreshToken;
    } else {
      // 없다면 토큰
      refreshTokenEntity = this.refreshTokenRepository.create({ user: { id: userId }, token: refreshToken });
    }
    await this.refreshTokenRepository.save(refreshTokenEntity);
  }
}
