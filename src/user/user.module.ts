import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

// Mock 함수 제작
const UserMockService = {
  findAll: () => {
    return 'find mock users';
  },
};

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  exports: [UserService],
  controllers: [UserController],
  providers: [
    // UserService,
    {
      // provide 이름은 UserService
      provide: UserService,
      // 실제 제공하는 useValue 값은 UserMockService
      useValue: UserMockService,
    },
  ],
})
export class UserModule {}
