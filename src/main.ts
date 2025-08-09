import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  const envieroment = configService.get<string>('NODE_ENV') || 'development';

  const frontendURL = configService.get<string>('FRONTEND_URL') || '*';

  app.enableCors({
    origin: envieroment === 'production' ? frontendURL : '*', // Cambia esto según tu dominio de producción
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Quita propiedades no definidas en DTO
      forbidNonWhitelisted: true, // Lanza error si vienen propiedades no permitidas
      forbidUnknownValues: true, // Asegura que los objetos no sean null o undefined
      transform: true, // Convierte tipos automáticamente (por ejemplo, de string a number)
    }),
  );

  const choosedTheme: SwaggerThemeNameEnum = SwaggerThemeNameEnum.ONE_DARK;

  const config = new DocumentBuilder()
    .setTitle('API procesador de CONTPAQi industria porcina')
    .setDescription('Documentación de la API')
    .setVersion('1.0')
    .addBearerAuth() // opcional: si usas JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const theme = new SwaggerTheme();
  const darkTheme = theme.getBuffer(choosedTheme);

  SwaggerModule.setup('api', app, document, {
    customCss: darkTheme,
  });

  await app.listen(port);
  if (envieroment === 'development') {
    console.log(`🚀 Server running at http://localhost:${port}`);
    console.log(`Documentation http://localhost:${port}/api`);
    const serverAddress = await app.getUrl();
    console.log(`🚀 Server running at ${serverAddress}`);
  } else if (envieroment === 'production') {
    // Generame la url del servidor
    const serverAddress = await app.getUrl();
    console.log(`🚀 Server running at ${serverAddress}`);
  }
}
bootstrap();
