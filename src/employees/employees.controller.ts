// src/employees/employees.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { ImportEmployeesResultDto } from './dto/import-employees-result.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './employee.entity';
import { EmployeesService } from './employees.service';

@ApiTags('employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @ApiOperation({ summary: 'Create employee' })
  @ApiBody({ type: CreateEmployeeDto })
  @ApiCreatedResponse({ type: Employee })
  create(@Body() createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    return this.employeesService.create(createEmployeeDto);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
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
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
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
  })
  @ApiOkResponse({ type: ImportEmployeesResultDto })
  importEmployees(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImportEmployeesResultDto> {
    return this.employeesService.importEmployees(file);
  }

  @Get()
  @ApiOperation({ summary: 'List employees' })
  @ApiOkResponse({ type: [Employee] })
  findAll(): Promise<Employee[]> {
    return this.employeesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by id' })
  @ApiOkResponse({ type: Employee })
  findOne(@Param('id') id: string): Promise<Employee> {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update employee' })
  @ApiOkResponse({ type: Employee })
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete employee' })
  @ApiOkResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.employeesService.remove(id);
  }
}
