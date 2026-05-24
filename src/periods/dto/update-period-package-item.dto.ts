import { PartialType } from '@nestjs/swagger';
import { CreatePeriodPackageItemDto } from './create-period-package-item.dto';

export class UpdatePeriodPackageItemDto extends PartialType(
  CreatePeriodPackageItemDto,
) {}
