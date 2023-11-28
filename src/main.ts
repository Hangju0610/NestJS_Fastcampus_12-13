import { SentryInterceptor } from './common/interceptor/sentry.interceptor';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { WinstonModule, utilities } from 'nest-winston';
import * as winston from 'winston';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';
import * as basicAuth from 'express-basic-auth';
import * as Sentry from '@sentry/node';

async function bootstrap() {
  const port = 3000;
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      // 로그를 어디로 전송할지
      transports: [
        new winston.transports.Console({
          level: process.env.STAGE === 'prod' ? 'info' : 'debug',
          format: winston.format.combine(
            winston.format.timestamp(),
            utilities.format.nestLike('NestJS', { prettyPrint: true, colors: true }),
          ),
        }),
      ],
    }),
  });

  const configService = app.get(ConfigService);
  const stage = configService.get('STAGE');
  // Swagger
  // local과 dev 환경에서만 Swagger가 보일수 있게 설정하기
  const SWAGGER_ENVS = ['local', 'dev'];
  if (SWAGGER_ENVS.includes(stage)) {
    app.use(
      // swagger 경로 암호 설정
      ['/docs', 'docs-json'],
      // express-basic-auth를 통해 암호 설정 진행
      basicAuth({
        challenge: true,
        users: {
          [configService.get('swagger.user')]: configService.get('swagger.password'),
        },
      }),
    );
    const config = new DocumentBuilder()
      .setTitle('NestJS project')
      .setDescription('NestJS project API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const customOption: SwaggerCustomOptions = {
      swaggerOptions: {
        persistAuthorization: true,
      },
    };
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, customOption);
  }

  // ValidationPipe 전역 적용
  app.useGlobalPipes(
    new ValidationPipe({
      // class-transformer 적용
      transform: true,
    }),
  );
  Sentry.init({ dsn: configService.get('SENTRY_DNS') });
  app.useGlobalInterceptors(new SentryInterceptor(), new TransformInterceptor());

  await app.listen(port);
  Logger.log(`STAGE: ${process.env.STAGE}`);
  Logger.log(`listening on port ${port}`);
}
bootstrap();
