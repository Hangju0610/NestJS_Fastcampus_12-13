import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { FindUserReqDto } from './dto/req.dto';
import { PageReqDto } from 'src/common/dto/req.dto';
import { ApiGetItemsResponse, ApiGetResponse } from 'src/common/decorator/swagger.decorator';
import { FindUserResDto } from './dto/res.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User, UserAfterAuth } from 'src/common/decorator/user.decorator';
import { Roles } from 'src/common/decorator/role.decorator';
import { Role } from './enum/user.enum';
import { Public } from 'src/common/decorator/public.decorator';

@ApiTags('User')
@ApiExtraModels(FindUserReqDto, FindUserReqDto, FindUserResDto)
@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @ApiGetItemsResponse(FindUserResDto)
  @Roles(Role.Admin)
  @Get()
  @UseGuards(JwtAuthGuard)
  // 비동기 처리를 위해 Promise로 데이터를 받는다.
  async findAll(@Query() { page, size }: PageReqDto): Promise<FindUserResDto[]> {
    throw new Error('에러 테스트');
    // 전체 유저수 확인 메서드
    // pagenation을 위해 Page Dto로 데이터를 받는다.
    const users = await this.userService.findAll(page, size);
    return users.map(({ id, email, createdAt }) => {
      return { id, email, createdAt: createdAt.toISOString() };
    });
  }

  @ApiBearerAuth()
  @ApiGetResponse(FindUserReqDto)
  @Get(':id')
  findOne(@Param() { id }: FindUserReqDto) {
    return this.userService.findOne(id);
  }

  @Public()
  @Post('bulk')
  createBulk() {
    return this.userService.createBulk();
  }
}
