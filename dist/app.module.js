"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const companies_module_1 = require("./companies/companies.module");
const employees_module_1 = require("./employees/employees.module");
const imports_module_1 = require("./imports/imports.module");
const invoices_module_1 = require("./invoices/invoices.module");
const items_module_1 = require("./items/items.module");
const periods_module_1 = require("./periods/periods.module");
const tools_module_1 = require("./tools/tools.module");
const units_module_1 = require("./units/units.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const nodeEnv = configService.get('NODE_ENV', 'development');
                    return {
                        type: 'postgres',
                        host: configService.get('DB_HOST', 'localhost'),
                        port: Number(configService.get('DB_PORT', '5432')),
                        username: configService.get('DB_USER', 'postgres'),
                        password: configService.get('DB_PASSWORD', 'postgres'),
                        database: configService.get('DB_NAME', 'welfare_db'),
                        autoLoadEntities: true,
                        synchronize: configService.get('DB_SYNCHRONIZE', '').toLowerCase() ===
                            'true' || nodeEnv !== 'production',
                        logging: configService.get('DB_LOGGING', '').toLowerCase() ===
                            'true' || nodeEnv === 'development',
                    };
                },
            }),
            auth_module_1.AuthModule,
            companies_module_1.CompaniesModule,
            units_module_1.UnitsModule,
            items_module_1.ItemsModule,
            employees_module_1.EmployeesModule,
            periods_module_1.PeriodsModule,
            imports_module_1.ImportsModule,
            invoices_module_1.InvoicesModule,
            tools_module_1.ToolsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map