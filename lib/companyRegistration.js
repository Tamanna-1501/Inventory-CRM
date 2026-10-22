import bcrypt from 'bcryptjs';
import { writeAuditLog } from './auditLog';

const DEFAULT_ROLES = [
  ['ADMIN', 'Full administrative access'],
  ['MANAGER', 'Company manager'],
  ['SUPERVISOR', 'Team supervisor'],
  ['STAFF', 'Inventory and sales staff'],
  ['BILLER', 'Point of sale biller'],
];

// Company, default roles aur pehla admin ek hi transaction me create hote hain.
export async function createCompanyWithAdmin(tx, input) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const company = await tx.company.create({
    data: {
      name: input.companyName.trim(),
      email: normalizedEmail,
      phone: input.phone?.trim() || null,
      status: 'active',
      source: input.source || 'self',
    },
  });

  const roles = {};
  for (const [name, description] of DEFAULT_ROLES) {
    roles[name] = await tx.role.create({
      data: { companyId: company.id, name, description, permissions: {} },
    });
  }

  const password = await bcrypt.hash(input.password, 12);
  const user = await tx.user.create({
    data: {
      companyId: company.id,
      name: input.adminName.trim(),
      email: normalizedEmail,
      phone: input.phone?.trim() || null,
      password,
      roleId: roles.ADMIN.id,
    },
  });

  // Company registration ka initial event bhi account creation transaction me rahega.
  await writeAuditLog(tx, input.actor || user, {
    companyId: company.id,
    action: 'create',
    entity: 'company',
    entityId: company.id,
    details: { source: company.source, companyName: company.name, initialAdminEmail: user.email },
  });

  return { company, user, role: roles.ADMIN };
}
