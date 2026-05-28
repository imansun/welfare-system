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
exports.XmlParserService = void 0;
const common_1 = require("@nestjs/common");
const fast_xml_parser_1 = require("fast-xml-parser");
let XmlParserService = class XmlParserService {
    parser;
    constructor() {
        this.parser = new fast_xml_parser_1.XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '',
            textNodeName: 'text',
            parseTagValue: false,
            parseAttributeValue: false,
            trimValues: true,
        });
    }
    parse(xmlContent) {
        try {
            return this.parser.parse(xmlContent);
        }
        catch (error) {
            throw new common_1.BadRequestException('فایل XML معتبر نیست یا قابل پردازش نمی‌باشد.');
        }
    }
};
exports.XmlParserService = XmlParserService;
exports.XmlParserService = XmlParserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], XmlParserService);
//# sourceMappingURL=xml-parser.service.js.map