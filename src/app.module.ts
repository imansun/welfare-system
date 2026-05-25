// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { EmployeesModule } from './employees/employees.module';
import { ImportsModule } from './imports/imports.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ItemsModule } from './items/items.module';
import { PeriodsModule } from './periods/periods.module';
import { ToolsModule } from './tools/tools.module';
import { UnitsModule } from './units/units.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV', 'development');

        return {
          type: 'postgres',

          host: configService.get<string>('DB_HOST', 'localhost'),

          port: Number(configService.get<string>('DB_PORT', '5432')),

          username: configService.get<string>('DB_USER', 'postgres'),

          password: configService.get<string>('DB_PASSWORD', 'postgres'),

          database: configService.get<string>('DB_NAME', 'welfare_db'),

          autoLoadEntities: true,

          /**
           * هشدار مهم:
           * synchronize در production نباید true باشد؛
           * چون ممکن است ساختار دیتابیس را ناخواسته تغییر دهد.
           *
           * برای production بهتر است از migration استفاده شود.
           */
          synchronize:
            configService.get<string>('DB_SYNCHRONIZE', '').toLowerCase() ===
              'true' || nodeEnv !== 'production',

          /**
           * اگر خواستی لاگ کوئری‌ها فقط در development فعال باشد.
           */
          logging:
            configService.get<string>('DB_LOGGING', '').toLowerCase() ===
              'true' || nodeEnv === 'development',
        };
      },
    }),

    AuthModule,
    CompaniesModule,
    UnitsModule,
    ItemsModule,
    EmployeesModule,
    PeriodsModule,
    ImportsModule,
    InvoicesModule,
    ToolsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
