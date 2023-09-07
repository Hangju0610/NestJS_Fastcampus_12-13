import { Controller, Request, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiCreatedResponse, ApiExtraModels, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { SigninReqDto, SignupReqDto } from './dto/req.dto';
import { SignupResDto } from './dto/res.dto';

@ApiTags('Auth')
@ApiExtraModels(SignupResDto)
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiCreatedResponse({
    schema: {
      allOf: [{ $ref: getSchemaPath(SignupResDto) }],
    },
  })
  @Post('signup')
  async signup(@Body() signupReqDto: SignupReqDto) {
    return this.authService.signup('email', 'password');
  }

  @Post('signin')
  async signin(@Body() signinReqDto: SigninReqDto) {
    return this.authService.signin({});
  }
}
