import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from "@nestjs/typeorm";

export const typeOrmConfigAsync: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
    const dbConfig = configService.get('database');
    const isProduction = configService.get('app.environment') === 'production';

    if (isProduction) {
      return {
        type: 'postgres',
        host: dbConfig.host,
        port: dbConfig.port,
        username: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.name,
        entities: [__dirname + '/../**/*.entity.{ts,js}'],
        synchronize: false, // false en producción
        migrations: [__dirname + '/../migrations/*{.ts,.js}'],
        migrationsRun: true, // true solo en producción
        logging: false, // false en producción
        ssl: {
          rejectUnauthorized: false
        }
      };
    }

    // Suponiendo que es desarrollo local
    return {
      type: 'postgres',
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.name,
      entities: [__dirname + '/../**/*.entity.{ts,js}'],
      synchronize: true, // false en producción
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      migrationsRun: false, // true solo en producción
      logging: true, // false en producción
    };
  },
};