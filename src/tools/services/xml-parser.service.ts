import { Injectable, BadRequestException } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';

@Injectable()
export class XmlParserService {
  private readonly parser: XMLParser;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      textNodeName: 'text',
      parseTagValue: false,
      parseAttributeValue: false,
      trimValues: true,
    });
  }

  parse(xmlContent: string): any {
    try {
      return this.parser.parse(xmlContent);
    } catch (error) {
      throw new BadRequestException('فایل XML معتبر نیست یا قابل پردازش نمی‌باشد.');
    }
  }
}
