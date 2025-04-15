import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { env } from './common/config';
import { SwaggerModule } from '@nestjs/swagger';
import { ApiSwaggerOptions } from './common/swagger/config.swagger';
import { HttpExceptionFilter } from './common/filter/httpException.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: { origin: '*' } });

  app.setGlobalPrefix('/api');

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((err) => {
          const constraints = Object.values(err.constraints || {});
          return `${err.property}: ${constraints.join(', ')}`;
        });
        return new BadRequestException(messages.join(' | '));
      },
    }),
  );

  if (env.ENV == 'dev') {
    const ApiDocs = SwaggerModule.createDocument(app, ApiSwaggerOptions);
    SwaggerModule.setup('docs', app, ApiDocs, {});
  }
  await app.listen(env.PORT || 3000);
}
bootstrap();
