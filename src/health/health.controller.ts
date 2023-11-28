import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { Public } from 'src/common/decorator/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private health: HealthCheckService, private db: TypeOrmHealthIndicator) {}

  @Get()
  @HealthCheck()
  @Public()
  check() {
    // db에 pingCheck을 통해 확인한다.
    return this.health.check([() => this.db.pingCheck('database')]);
  }
}
