import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { FindUserReqDto } from './dto/req.dto';
import { PageReqDto } from 'src/common/dto/req.dto';
import { ApiGetItemsResponse, ApiGetResponse } from 'src/common/decorator/swagger.decorator';
import { FindUserResDto } from './dto/res.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('User')
@ApiExtraModels(FindUserReqDto, FindUserReqDto, FindUserResDto)
@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @ApiGetItemsResponse(FindUserResDto)
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() { page, size }: PageReqDto) {
    return this.userService.findAll();
  }

  @ApiGetResponse(FindUserReqDto)
  @Get(':id')
  findOne(@Param() { id }: FindUserReqDto) {
    return this.userService.findOne(id);
  }
}
