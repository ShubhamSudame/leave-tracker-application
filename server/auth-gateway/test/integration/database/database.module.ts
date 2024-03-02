import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'better-sqlite3',
        name: configService.get<string>('TEST_DB_NAME'),
        database: ':memory:',
        synchronize: configService.get<string>('ENV') !== 'Production',
        entities: [
          `${__dirname}/../entities/*.entity.ts`,
          `${__dirname}/../entities/*.entity.js`,
        ],
        logging: false,
      }),
    }),
  ],
})
export class TestDatabaseModule {}
