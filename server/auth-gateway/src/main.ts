import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';
import csurf from 'csurf';

declare const module: any;

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule, { snapshot: true });
  const configService = app.get(ConfigService);

  const openAPIConfig = new DocumentBuilder()
    .setTitle('Holidays API')
    .setDescription('')
    .setVersion('1.0')
    .addServer('http://localhost:3000/', 'Local Envirionment')
    .build();
  const document = SwaggerModule.createDocument(app, openAPIConfig);
  SwaggerModule.setup('api', app, document);

  app.setGlobalPrefix('api/v1');
  app
    .use(helmet())
    .use(cookieParser())
    .use(csurf())
    .use(bodyParser.json())
    .use(
      cors({
        origin: '*',
        methods: 'GET,PUT,POST,DELETE,PATCH,HEAD',
        optionsSuccessStatus: 204,
        credentials: true,
      }),
    );
  await app.listen(Number(configService.getOrThrow<number>('port')));

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
};

bootstrap();
