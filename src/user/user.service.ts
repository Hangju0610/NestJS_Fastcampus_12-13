import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { Role } from './enum/user.enum';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  async findAll(page: number, size: number) {
    return await this.userRepository.find({
      skip: (page - 1) * size,
      take: size,
    });
  }

  async findOne(id: string) {
    return 'find user';
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    return user;
  }

  async checkUserIsAdmin(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    // 어드민인 경우 true, 아닌 경우 false 출력
    return user.role === Role.Admin;
  }

  async createBulk(): Promise<void> {
    for (let i = 4; i <= 10000; i++) {
      await this.userRepository.save(
        this.userRepository.create({ email: `nestjs${i}@fastcampus.com`, password: 'Password1!' }),
      );
    }
  }
}
