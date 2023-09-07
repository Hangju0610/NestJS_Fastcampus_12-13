import { Controller, Request, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiCreatedResponse, ApiExtraModels, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { SigninReqDto, SignupReqDto } from './dto/req.dto';
import { SigninResDto, SignupResDto } from './dto/res.dto';
import { ApiPostResponse } from 'src/common/decorator/swagger.decorator';
import { IS_PUBLIC_KEY, Public } from 'src/common/decorator/public.decorator';

@ApiTags('Auth')
@ApiExtraModels(SignupResDto, SigninResDto)
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiPostResponse(SignupResDto)
  @Public()
  @Post('signup')
  async signup(@Body() { email, password, passwordConfirm }: SignupReqDto) {
    console.log(IS_PUBLIC_KEY);
    if (password !== passwordConfirm) throw new BadRequestException('비밀번호가 맞지 않습니다.');
    const { id } = await this.authService.signup(email, password);
    return { id };
  }

  @ApiPostResponse(SigninResDto)
  // Public 데코레이터를 통해 IS_PUBLIC_KEY를 입력한다.
  @Public()
  @Post('signin')
  async signin(@Body() { email, password }: SigninReqDto) {
    return this.authService.signin(email, password);
  }
}
