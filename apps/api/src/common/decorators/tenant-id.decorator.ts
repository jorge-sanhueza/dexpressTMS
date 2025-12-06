import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

export const TenantId = createParamDecorator(
  (data: { optional?: boolean } = {}, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    const tenantId = user?.tenant_id ?? user?.tenantId ?? user?.tenant?.id;

    if (!tenantId && !data.optional) {
      throw new BadRequestException('Tenant ID not found in JWT token');
    }

    return tenantId as string | null;
  },
);
