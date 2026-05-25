// src\imports\imports.controller.ts
import {
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ImportRecipientsResultDto } from './dto/import-recipients-result.dto';
import { ImportsService } from './imports.service';

@ApiTags('imports')
@Controller('imports')
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post('periods/:periodId/recipients')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Import period recipients from Excel' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiCreatedResponse({ type: ImportRecipientsResultDto })
  importRecipients(
    @Param('periodId', ParseUUIDPipe) periodId: string,
    @UploadedFile() file: { buffer: Buffer },
  ): Promise<ImportRecipientsResultDto> {
    return this.importsService.importRecipients(periodId, file);
  }
}
