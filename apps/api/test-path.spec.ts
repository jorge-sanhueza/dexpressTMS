// test-path.spec.ts in apps/api directory

import { PrismaService } from '@prisma/prisma.service';

describe('Path Test', () => {
  it('should import PrismaService', () => {
    // Just checking if import works
    expect(typeof PrismaService).toBe('function');
  });
});
