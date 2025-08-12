import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('app.port') || 3000;  // Accede al valor anidado
  const environment = configService.get<string>('app.environment');
  const frontendURL = configService.get<string>('app.frontendUrl'); // Nota: frontendUrl (camelCase)

  const corsOptions = {
    origin: environment === 'development' ? '*' : frontendURL,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  };

  app.enableCors(corsOptions);

  app.use(helmet());

  // Middleware adicional para producción (opcional pero recomendado)
  app.use((req: Request, res: Response, next: NextFunction) => {
    const allowedOrigins = [frontendURL];
    const origin = req.headers.origin;

    if (environment === 'production' && origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    // Headers adicionales de seguridad
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    next();
  });


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
