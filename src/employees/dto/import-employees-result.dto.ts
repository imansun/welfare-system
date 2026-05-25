import { ApiProperty } from '@nestjs/swagger';

export class ImportEmployeesResultDto {
  @ApiProperty()
  totalRows: number;

  @ApiProperty()
  imported: number;

  @ApiProperty()
  updated: number;

  @ApiProperty()
  skipped: number;

  @ApiProperty({ type: [String] })
  errors: string[];
}
