import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { I18nValidationPipe, I18nValidationExceptionFilter } from 'nestjs-i18n';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173', 'https://tickets-flow.netlify.app'],
  });

  app.useGlobalPipes(new I18nValidationPipe());
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({ detailedErrors: false }),
  );

  const config = new DocumentBuilder()
    .setTitle('Ticket Flow API')
    .setDescription('Customer support ticketing system API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
