import { RefreshToken } from 'src/auth/entity/refresh-token.entity';
import { Video } from 'src/video/entity/video.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../enum/user.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // unique를 걸면 자동으로 인덱스가 생성된다.
  // unique가 걸리면 기본적으로 btree 형태의 자료구조로 인덱스가 형성 (postgreSQL)
  // 혹은 index를 넣고 싶으면
  // @Index() 데코레이터를 추가하면 된다. option : 이름을 넣어줄 수 있다.
  @Column({ unique: true })
  email: string;

  @Column({ type: 'enum', enum: Role })
  // 초기 값은 User로 설정하기.
  role: Role = Role.User;

  @Column()
  password: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Video, (video) => video.user)
  videos: Video[];

  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshToken: RefreshToken;
}
