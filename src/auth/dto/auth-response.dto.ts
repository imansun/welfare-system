import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/user-role.enum';

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  user: {
    id: string;
    username: string;
    displayName: string;
    email: string | null;
    role: UserRole;
  };
}
