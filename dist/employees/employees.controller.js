"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const create_employee_dto_1 = require("./dto/create-employee.dto");
const import_employees_result_dto_1 = require("./dto/import-employees-result.dto");
const update_employee_dto_1 = require("./dto/update-employee.dto");
const employee_entity_1 = require("./employee.entity");
const employees_service_1 = require("./employees.service");
let EmployeesController = class EmployeesController {
    employeesService;
    constructor(employeesService) {
        this.employeesService = employeesService;
    }
    create(createEmployeeDto) {
        return this.employeesService.create(createEmployeeDto);
    }
    importEmployees(file) {
        return this.employeesService.importEmployees(file);
    }
    findAll() {
        return this.employeesService.findAll();
    }
    findOne(id) {
        return this.employeesService.findOne(id);
    }
    update(id, updateEmployeeDto) {
        return this.employeesService.update(id, updateEmployeeDto);
    }
    remove(id) {
        return this.employeesService.remove(id);
    }
};
exports.EmployeesController = EmployeesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create employee' }),
    (0, swagger_1.ApiBody)({ type: create_employee_dto_1.CreateEmployeeDto }),
    (0, swagger_1.ApiCreatedResponse)({ type: employee_entity_1.Employee }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_employee_dto_1.CreateEmployeeDto]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({
        summary: 'وارد کردن کارمندان از فایل اکسل',
        description: `
# راهنمای وارد کردن کارمندان از فایل اکسل

## هدف
این امکان به شما اجازه می‌دهد تا اطلاعات کارمندان را به صورت دسته‌ای و از طریق یک فایل اکسل وارد سیستم کنید. با این روش می‌توانید در زمان خود صرفه‌جویی کرده و از ورود تکراری اطلاعات جلوگیری کنید.

## فرمت فایل
- **نوع فایل:** اکسل با پسوند \`.xlsx\` یا \`.xls\`
- **برگه (Sheet):** فقط اولین برگه فایل خوانده می‌شود
- **سطر اول:** باید شامل نام ستون‌ها (هدر) باشد
- **نام ستون‌ها:** حساس به حروف بزرگ/کوچک نیستند و فاصله، زیرخط (_) و خط تیره (-) در آن‌ها نادیده گرفته می‌شود

## ستون‌های مورد نیاز

| نام ستون (انگلیسی) | معادل فارسی | الزامی/اختیاری | توضیحات |
|-------------------|-------------|---------------|---------|
| \`personnelCode\` | کد پرسنلی | **الزامی** | کد یکتای هر کارمند. اگر خالی باشد، سطر نادیده گرفته می‌شود |
| \`fullName\` | نام و نام خانوادگی، نام | **الزامی** | نام کامل کارمند. اگر خالی باشد، سطر نادیده گرفته می‌شود |
| \`isActive\` | فعال، وضعیت | اختیاری | وضعیت فعالیت کارمند. پیش‌فرض: \`true\` (فعال) |
| \`companyCode\` | کد شرکت | اختیاری | کد شرکت مربوطه |
| \`companyName\` | نام شرکت، شرکت | اختیاری | نام شرکت مربوطه |

### مقادیر مجاز برای ستون \`isActive\` (وضعیت فعالیت)

**مقادیر فعال (true):**
- انگلیسی: \`true\`, \`1\`, \`yes\`, \`y\`, \`active\`
- فارسی: \`فعال\`, \`بلی\`, \`بله\`

**مقادیر غیرفعال (false):**
- انگلیسی: \`false\`, \`0\`, \`no\`, \`n\`, \`inactive\`
- فارسی: \`غیرفعال\`, \`غيرفعال\`, \`خیر\`, \`نه\`

> ⚠️ توجه: استفاده از مقادیر دیگر باعث ایجاد خطا می‌شود.

## رفتار سیستم در شرایط مختلف

### ۱. شرکت‌ها (Companies)
- اگر **کد شرکت** ارائه شده باشد، سیستم ابتدا شرکت را بر اساس کد جستجو می‌کند
- اگر شرکت با کد مورد نظر یافت نشد، سیستم بر اساس **نام شرکت** جستجو می‌کند
- اگر هیچ شرکتی یافت نشد، **یک شرکت جدید به صورت خودکار ایجاد می‌شود** با:
  - کد: همان کد ارائه شده (یا null اگر کدی نبوده)
  - نام: نام شرکت (یا کد شرکت اگر نامی نبوده)
  - وضعیت: فعال (\`true\`)
- اگر neither کد شرکت و neither نام شرکت ارائه نشده باشد، فیلد شرکت برای آن کارمند خالی (null) می‌ماند

### ۲. کارمندان جدید در مقابل به‌روزرسانی
- اگر **کد پرسنلی** در فایل تکراری باشد → آن سطر **نادیده گرفته می‌شود** و خطا ثبت می‌گردد
- اگر **کد پرسنلی** قبلاً در پایگاه داده وجود داشته باشد → رکورد **به‌روزرسانی** می‌شود (نام کامل، شرکت و وضعیت فعالیت بازنویسی می‌شوند)
- اگر **کد پرسنلی** جدید باشد → یک رکورد کارمند **جدید ایجاد** می‌شود

## مثال ساختار فایل اکسل

| personnelCode | fullName | isActive | companyCode | companyName |
|--------------|----------|----------|-------------|-------------|
| 1001 | علی رضایی | true | C001 | شرکت فناوری نوین |
| 1002 | مریم محمدی | فعال | C002 | گروه صنعتی پارس |
| 1003 | حسین کریمی | 1 | | استارتاپ ایده |

یا با نام‌های فارسی:

| کد پرسنلی | نام و نام خانوادگی | وضعیت | کد شرکت | نام شرکت |
|----------|-------------------|-------|---------|----------|
| 1001 | علی رضایی | بله | C001 | شرکت فناوری نوین |
| 1002 | مریم محمدی | فعال | C002 | گروه صنعتی پارس |

## خروجی عملیات وارد کردن

پس از پایان عملیات، نتیجه به صورت زیر بازگردانده می‌شود:

| فیلد | توضیحات |
|-----|---------|
| \`totalRows\` | تعداد کل سطرها processed شده از فایل اکسل |
| \`imported\` | تعداد کارمندان جدید ایجاد شده |
| \`updated\` | تعداد کارمندان موجود که به‌روزرسانی شدند |
| \`skipped\` | تعداد سطرهایی که به دلیل خطا نادیده گرفته شدند |
| \`errors\` | آرایه‌ای از پیام‌های خطا (شامل شماره سطر و دلیل خطا) |

## نکات مهم و موارد خاص

✅ **نکات کلیدی:**
1. حداقل یکی از ستون‌های \`personnelCode\` یا \`fullName\` باید پر باشد، در غیر این صورت سطر نادیده گرفته می‌شود
2. کد پرسنلی تکراری **در داخل یک فایل** مجاز نیست
3. نام ستون‌ها حساس به حروف بزرگ/کوچک نیست (مثلاً \`PersonnelCode\` = \`personnelcode\`)
4. فاصله، زیرخط و خط تیره در نام ستون‌ها نادیده گرفته می‌شود (مثلاً \`personnel_code\` = \`personnelcode\`)
5. اگر شرکت یافت نشود، به صورت خودکار ایجاد می‌شود - نگران نباشید!
6. سطر هدر (سطر اول) جزو داده‌ها محسوب نمی‌شود

❌ **خطاهای رایج:**
- خالی بودن کد پرسنلی یا نام کامل
- تکراری بودن کد پرسنلی در فایل
- مقدار نامعتبر برای ستون وضعیت (\`isActive\`)

💡 **پیشنهاد:** قبل از ارسال فایل نهایی، یک فایل تستی با چند سطر آماده کنید و نتیجه را بررسی نمایید.
    `,
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'فایل اکسل برای وارد کردن کارمندان',
        schema: {
            type: 'object',
            required: ['file'],
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'فایل اکسل (.xlsx یا .xls)',
                },
            },
        },
    }),
    (0, swagger_1.ApiOkResponse)({ type: import_employees_result_dto_1.ImportEmployeesResultDto }),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "importEmployees", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List employees' }),
    (0, swagger_1.ApiOkResponse)({ type: [employee_entity_1.Employee] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get employee by id' }),
    (0, swagger_1.ApiOkResponse)({ type: employee_entity_1.Employee }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update employee' }),
    (0, swagger_1.ApiOkResponse)({ type: employee_entity_1.Employee }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_employee_dto_1.UpdateEmployeeDto]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete employee' }),
    (0, swagger_1.ApiOkResponse)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "remove", null);
exports.EmployeesController = EmployeesController = __decorate([
    (0, swagger_1.ApiTags)('employees'),
    (0, common_1.Controller)('employees'),
    __metadata("design:paramtypes", [employees_service_1.EmployeesService])
], EmployeesController);
//# sourceMappingURL=employees.controller.js.map