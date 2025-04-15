import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { env } from './common/config';
import { SwaggerModule } from '@nestjs/swagger';
import { ApiSwaggerOptions } from './common/swagger/config.swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: { origin: '*' } });

  app.setGlobalPrefix('/api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  if (env.ENV == 'dev') {
    const ApiDocs = SwaggerModule.createDocument(app, ApiSwaggerOptions);
    SwaggerModule.setup('docs', app, ApiDocs, {});
  }
  await app.listen(env.PORT || 3000);
}
bootstrap();
