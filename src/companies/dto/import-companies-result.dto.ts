// src\companies\dto\import-companies-result.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ImportCompaniesResultDto {
  @ApiProperty()
  imported: number;

  @ApiProperty()
  skipped: number;

  @ApiProperty({ type: [String] })
  errors: string[];
}
