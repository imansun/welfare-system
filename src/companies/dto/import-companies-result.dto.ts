import { ApiProperty } from '@nestjs/swagger';

export class ImportCompaniesResultDto {
  @ApiProperty()
  imported: number;

  @ApiProperty()
  skipped: number;

  @ApiProperty({ type: [String] })
  errors: string[];
}
