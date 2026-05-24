import { ApiProperty } from '@nestjs/swagger';

export class ImportRecipientsResultDto {
  @ApiProperty()
  periodId: string;

  @ApiProperty()
  imported: number;

  @ApiProperty()
  skipped: number;

  @ApiProperty({ type: [String] })
  errors: string[];
}
