import { ApiProperty } from '@nestjs/swagger';

export class GenerateInvoicesResultDto {
  @ApiProperty()
  periodId: string;

  @ApiProperty()
  generated: number;

  @ApiProperty()
  skipped: number;
}
