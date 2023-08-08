import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../user/enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true; // No role required, access is granted
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Assuming you store user information in the request

    if (!user) {
      return false; // User is not authenticated
    }

    return requiredRoles.includes(user.role);
  }
}
