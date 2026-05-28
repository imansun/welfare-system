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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePeriodDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreatePeriodDto {
    code;
    title;
    year;
    month;
    description;
    createdById;
}
exports.CreatePeriodDto = CreatePeriodDto;
__decorate([
    (0, swagger_1.ApiProperty)({ maxLength: 100 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreatePeriodDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ maxLength: 255 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreatePeriodDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ minimum: 1300, maximum: 9999 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1300),
    (0, class_validator_1.Max)(9999),
    __metadata("design:type", Number)
], CreatePeriodDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ minimum: 1, maximum: 12 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    __metadata("design:type", Number)
], CreatePeriodDto.prototype, "month", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePeriodDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePeriodDto.prototype, "createdById", void 0);
//# sourceMappingURL=create-period.dto.js.map