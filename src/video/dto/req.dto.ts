import { ApiProperty } from '@nestjs/swagger';

export class CreateVideoReqDto {
  @ApiProperty({ required: true })
  title: string;

  // 실제 비디오 영상을 바이너리 형태로 업로드
  @ApiProperty({ type: 'string', format: 'binary', required: true })
  video: any;
}

export class FindVideoReqDto {
  @ApiProperty({ required: true })
  id: string;
}
