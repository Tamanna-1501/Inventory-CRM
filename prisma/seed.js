const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = String(process.env.SUPER_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.SUPER_ADMIN_PASSWORD || '');
  const name = String(process.env.SUPER_ADMIN_NAME || 'Super Admin').trim();

  if (!email || !password) throw new Error('SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are required.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('SUPER_ADMIN_EMAIL must be a valid email.');
  if (password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('SUPER_ADMIN_PASSWORD must be at least 12 characters and at most 72 UTF-8 bytes.');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && !existing.isSuperAdmin) {
    throw new Error('The configured email already belongs to a company user; refusing to promote it.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    create: { email, name, password: passwordHash, companyId: null, roleId: null, isSuperAdmin: true, status: 'active' },
    update: { name, password: passwordHash, companyId: null, roleId: null, isSuperAdmin: true, status: 'active' },
  });
  console.log(`Super Admin seeded: ${email}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => prisma.$disconnect());
