import { createHash } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const WINDOW_MINUTES = 15;
const LOCK_MINUTES = 15;
const EMAIL_LIMIT = 8;
const IP_LIMIT = 50;
const CLEANUP_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function bucketKey(kind, value) {
  return createHash('sha256').update(`${kind}:${String(value).trim().toLowerCase()}`).digest('hex');
}

export function getClientIp(request) {
  // Reverse proxy ko client ka forged x-forwarded-for hata kar apna trusted IP set karna chahiye.
  const forwarded = request.headers.get('x-forwarded-for');
  const candidate = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip')?.trim();
  if (!candidate || candidate.length > 100) return null;
  return candidate;
}

function getBuckets(email, ip) {
  const buckets = [{ bucketKey: bucketKey('email', email), maxAttempts: EMAIL_LIMIT }];
  if (ip) buckets.push({ bucketKey: bucketKey('ip', ip), maxAttempts: IP_LIMIT });
  return buckets;
}

export async function getLoginBlock(email, ip) {
  const keys = getBuckets(email, ip).map((bucket) => bucket.bucketKey);
  const now = new Date();
  const records = await prisma.loginAttempt.findMany({
    where: { bucketKey: { in: keys }, blockedUntil: { gt: now } },
    select: { blockedUntil: true },
  });
  const blockedUntil = records.reduce((latest, row) => row.blockedUntil > latest ? row.blockedUntil : latest, records[0]?.blockedUntil || new Date(0));
  if (blockedUntil <= now) return null;
  return Math.max(1, Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000));
}

export async function recordLoginFailure(email, ip) {
  const buckets = getBuckets(email, ip);
  await prisma.$transaction(async (tx) => {
    for (const bucket of buckets) {
      await tx.$executeRaw(Prisma.sql`
        INSERT INTO \`LoginAttempt\`
          (\`bucketKey\`, \`failedAttempts\`, \`maxAttempts\`, \`windowStartedAt\`, \`blockedUntil\`, \`updatedAt\`)
        VALUES
          (${bucket.bucketKey}, 1, ${bucket.maxAttempts}, UTC_TIMESTAMP(3), NULL, UTC_TIMESTAMP(3))
        ON DUPLICATE KEY UPDATE
          \`blockedUntil\` = IF(
            \`windowStartedAt\` <= DATE_SUB(UTC_TIMESTAMP(3), INTERVAL ${WINDOW_MINUTES} MINUTE),
            NULL,
            IF(\`failedAttempts\` + 1 >= ${bucket.maxAttempts}, DATE_ADD(UTC_TIMESTAMP(3), INTERVAL ${LOCK_MINUTES} MINUTE), \`blockedUntil\`)
          ),
          \`failedAttempts\` = IF(
            \`windowStartedAt\` <= DATE_SUB(UTC_TIMESTAMP(3), INTERVAL ${WINDOW_MINUTES} MINUTE),
            1,
            \`failedAttempts\` + 1
          ),
          \`maxAttempts\` = ${bucket.maxAttempts},
          \`windowStartedAt\` = IF(
            \`windowStartedAt\` <= DATE_SUB(UTC_TIMESTAMP(3), INTERVAL ${WINDOW_MINUTES} MINUTE),
            UTC_TIMESTAMP(3),
            \`windowStartedAt\`
          ),
          \`updatedAt\` = UTC_TIMESTAMP(3)
      `);
    }
  });

  if (Math.random() < 0.01) {
    try {
      await prisma.loginAttempt.deleteMany({ where: { updatedAt: { lt: new Date(Date.now() - CLEANUP_AGE_MS) } } });
    } catch (error) {
      console.error('Login rate limit cleanup error:', error);
    }
  }
}

export async function clearEmailLoginFailures(email) {
  await prisma.loginAttempt.deleteMany({ where: { bucketKey: bucketKey('email', email) } });
}
