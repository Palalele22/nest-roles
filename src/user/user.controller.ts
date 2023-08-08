import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from './user.entity';
import { JwtGuard, RolesGuard } from '../auth/guards';
import { GetUser, Roles } from '../auth/decorators';
import { UserRole } from './enums';

@UseGuards(JwtGuard, RolesGuard)
@Controller('users')
export class UserController {
  @Get('me')
  @Roles(UserRole.USER)
  getMe(@GetUser() user: User) {
    return user;
  }
}
