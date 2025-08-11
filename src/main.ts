import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT') || 3000;
  const environment = configService.get<string>('NODE_ENV') || 'development';
  const frontendURL = configService.get<string>('FRONTEND_URL') || '*';

  // ✅ Configuración CORS según entorno
  if (environment === 'development') {
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });
  } else {
    // Forzar CORS manualmente en producción
    app.use((req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', frontendURL);
      res.header(
        'Access-Control-Allow-Methods',
        'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      );
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.header('Access-Control-Allow-Credentials', 'true');
      if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
      }
      next();
    });
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
    }),
  );

  // Swagger
  const choosedTheme: SwaggerThemeNameEnum = SwaggerThemeNameEnum.ONE_DARK;
  const config = new DocumentBuilder()
    .setTitle('API procesador de CONTPAQi industria porcina')
    .setDescription('Documentación de la API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const theme = new SwaggerTheme();
  const darkTheme = theme.getBuffer(choosedTheme);

  SwaggerModule.setup('api', app, document, {
    customCss: darkTheme,
  });

  await app.listen(port);

  const serverAddress = await app.getUrl();
  console.log(`🚀 Server running at ${serverAddress}`);
  if (environment === 'development') {
    console.log(`Documentation: ${serverAddress}/api`);
  }
}
bootstrap();
