import { Controller, Request, Post, Body, BadRequestException, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiCreatedResponse, ApiExtraModels, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { SigninReqDto, SignupReqDto } from './dto/req.dto';
import { RefreshResDto, SigninResDto, SignupResDto } from './dto/res.dto';
import { ApiPostResponse } from 'src/common/decorator/swagger.decorator';
import { IS_PUBLIC_KEY, Public } from 'src/common/decorator/public.decorator';
import { User, UserAfterAuth } from 'src/common/decorator/user.decorator';
import { RefreshToken } from './entity/refresh-token.entity';

@ApiTags('Auth')
@ApiExtraModels(SignupResDto, SigninResDto, RefreshResDto)
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiPostResponse(SignupResDto)
  @Public()
  @Post('signup')
  async signup(@Body() { email, password, passwordConfirm }: SignupReqDto): Promise<SignupResDto> {
    if (password !== passwordConfirm) throw new BadRequestException('비밀번호가 맞지 않습니다.');
    const { id, accessToken, refreshToken } = await this.authService.signup(email, password);
    return { id, accessToken, refreshToken };
  }

  @ApiPostResponse(SigninResDto)
  // Public 데코레이터를 통해 IS_PUBLIC_KEY를 입력한다.
  @Public()
  @Post('signin')
  async signin(@Body() { email, password }: SigninReqDto) {
    return this.authService.signin(email, password);
  }

  // refreshToken 확인용
  @ApiPostResponse(RefreshResDto)
  // Swagger에서 로그인 시 BearerAuth를 통해 로그인 진행
  @ApiBearerAuth()
  @Post('refresh')
  async refresh(@Headers('authorization') authorization, @User() user: UserAfterAuth) {
    const token = /Bearer\s(.+)/.exec(authorization)[1];
    const { accessToken, refreshToken } = await this.authService.refresh(token, user.id);
    return { accessToken, refreshToken };
  }
}
