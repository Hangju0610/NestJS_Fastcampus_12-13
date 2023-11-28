import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { VideoService } from './video.service';
import { CreateVideoReqDto, FindVideoReqDto } from './dto/req.dto';
import { PageReqDto } from 'src/common/dto/req.dto';
import { CreateVideoResDto, FindVideoResDto } from './dto/res.dto';
import { ApiGetItemsResponse, ApiGetResponse, ApiPostResponse } from 'src/common/decorator/swagger.decorator';
import { PageResDto } from 'src/common/dto/res.dto';
import { ThrottlerBehindProxyGuard } from 'src/common/guards/throttler-behind-proxy.guard';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { User, UserAfterAuth } from 'src/common/decorator/user.decorator';
import { CreateVideoCommand } from './command/create-video.command';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FindVideosQuery } from './query/find-videos.query';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@UseGuards(ThrottlerBehindProxyGuard)
@ApiTags('Video')
@ApiExtraModels(FindVideoReqDto, PageReqDto, CreateVideoResDto, FindVideoResDto, PageResDto)
@Controller('api/videos')
export class VideoController {
  constructor(
    private readonly videoService: VideoService,
    // cqrs command와 query 생성자로 구현
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  // Consumer 등록하여 파일 업로드 할 수 있도록 진행
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiPostResponse(CreateVideoResDto)
  // interceptor 모듈을 통해 파일 업로드
  @UseInterceptors(FileInterceptor('video'))
  @Post()
  async upload(
    @UploadedFile(
      new ParseFilePipeBuilder()
        // 파일 타입 검증 진행
        .addFileTypeValidator({ fileType: 'mp4' })
        // 맥스 사이즈는 10mb로 진행
        .addMaxSizeValidator({ maxSize: 10 * 1024 * 1024 })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    ) // file은 Express의 multer로 진행
    file: Express.Multer.File,
    @Body()
    createVideoReqDto: CreateVideoReqDto,
    @User() user: UserAfterAuth,
  ): Promise<CreateVideoResDto> {
    const { mimetype, originalname, buffer } = file;
    const extension = originalname.split('.')[1];
    const { title } = createVideoReqDto;
    // command 생성을 먼저 진행
    const command = new CreateVideoCommand(user.id, title, mimetype, extension, buffer);
    // commandBus를 통해 Command 실행
    const { id } = await this.commandBus.execute(command);
    return { id, title };
  }

  @ApiBearerAuth()
  @ApiGetItemsResponse(FindVideoResDto)
  @SkipThrottle()
  @Get()
  async findAll(@Query() { page, size }: PageReqDto): Promise<FindVideoResDto[]> {
    // Query를 진행합니다.
    const findVideosQuery = new FindVideosQuery(page, size);
    // queryBus를 통해 Query를 실행시킨다.
    const videos = await this.queryBus.execute(findVideosQuery);
    return videos.map(({ id, title, user }) => {
      return {
        id,
        title,
        user: {
          id: user.id,
          email: user.email,
        },
      };
    });
  }

  @ApiBearerAuth()
  @ApiGetResponse(FindVideoResDto)
  @Get(':id')
  async findOne(@Param() { id }: FindVideoReqDto): Promise<FindVideoResDto> {
    const { title, user } = await this.videoService.findOne(id);
    return {
      id,
      title,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  @ApiBearerAuth()
  // Throttle을 조금 더 타이트하게 주고싶은 경우
  @Throttle({ default: { ttl: 3, limit: 10 } })
  @Get(':id/download')
  // passthrough를 통해 res 호출 이후, 응답을 추가하도록 한다.
  // Nest에서 저 설정을 해주지 않으면 res 후 자동으로 응답이 반환되기 때문에, 이 응답을 해줘야 한다.
  async download(@Param() { id }: FindVideoReqDto, @Res({ passthrough: true }) res: Response) {
    const { stream, mimetype, size } = await this.videoService.download(id);
    res.set({
      'Content-Length': size,
      'Content-Type': mimetype,
      'Content-Disposition': 'attachment',
    });
    return new StreamableFile(stream);
  }
}
