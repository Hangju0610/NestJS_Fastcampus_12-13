import { ICommand } from '@nestjs/cqrs';

// cqrs ICommand를 통해 구현 진행
export class CreateVideoCommand implements ICommand {
  constructor(
    readonly userId: string,
    readonly title: string,
    readonly mimetype: string,
    readonly extension: string,
    readonly buffer: Buffer,
  ) {}
}
