import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateVideoReqDto {
  @ApiProperty({ required: true })
  @MinLength(2)
  @MaxLength(30)
  @IsString()
  title: string;

  // 실제 비디오 영상을 바이너리 형태로 업로드
  @ApiProperty({ type: 'string', format: 'binary', required: true })
  video: any;
}

export class FindVideoReqDto {
  @ApiProperty({ required: true })
  @IsUUID()
  id: string;
}
