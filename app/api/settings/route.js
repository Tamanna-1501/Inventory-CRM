import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/apiAuth';
import { isAdminRole } from '@/lib/permissions';
import { writeAuditLog } from '@/lib/auditLog';

const DEFAULT_SETTINGS = {
  companyName: '',
  companyEmail: '',
  companyPhone: '',
  companyAddress: '',
  companyLogo: '',
  footerText: '© 2026 Inventual. All rights reserved.',
  taxPercent: 0,
  invoicePrefix: 'INV',
  themeMode: 'light',
  themeBgColor: '#f9fafb',
  currencyName: 'Indian Rupee',
  currencyCode: 'INR',
  currencySymbol: '₹',
  currencyPosition: 'prefix',
  decimalDigits: 2,
  defaultWarehouseId: '',
  defaultBillerId: '',
  defaultCustomerId: '',
  soundEffect: true,
  autoPrintReceipt: true,
  defaultLanguage: 'en',
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12h',
};

const SETTING_KEYS = new Set(Object.keys(DEFAULT_SETTINGS));
const BOOLEAN_KEYS = new Set(['soundEffect', 'autoPrintReceipt']);
const REFERENCE_KEYS = {
  defaultWarehouseId: ['warehouse', 'id'],
  defaultBillerId: ['biller', 'id'],
  defaultCustomerId: ['customer', 'id'],
};

function asPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function isCompanyAdmin(user) {
  return !user.isSuperAdmin && Boolean(user.companyId) && isAdminRole(user.role?.name);
}

function settingsFor(company) {
  const stored = { ...asPlainObject(company.settings) };
  for (const key of ['mailHost', 'mailPort', 'mailUsername', 'mailPassword', 'mailEncryption', 'smsProvider', 'smsApiKey', 'smsSenderId', 'sendNotification', 'newsletterEnabled']) {
    delete stored[key];
  }
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    companyName: company.name,
    companyEmail: company.email,
    companyPhone: company.phone || '',
    companyAddress: company.address || '',
  };
}

export async function GET() {
  const user = await getUserFromRequest();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  if (!isCompanyAdmin(user)) return NextResponse.json({ message: 'Access denied: company admin only' }, { status: 403 });

  const company = await prisma.company.findFirst({ where: { id: user.companyId } });
  if (!company) return NextResponse.json({ message: 'Company not found' }, { status: 404 });
  return NextResponse.json(settingsFor(company));
}

export async function PUT(request) {
  const user = await getUserFromRequest();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  if (!isCompanyAdmin(user)) return NextResponse.json({ message: 'Access denied: company admin only' }, { status: 403 });

  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ message: 'Settings must be an object' }, { status: 400 });
    }
    const currentCompany = await prisma.company.findFirst({ where: { id: user.companyId } });
    if (!currentCompany) return NextResponse.json({ message: 'Company not found' }, { status: 404 });

    const updates = {};
    for (const [key, rawValue] of Object.entries(body)) {
      if (!SETTING_KEYS.has(key)) continue; // companyId / unknown fields client se save nahi hote
      if (BOOLEAN_KEYS.has(key)) {
        if (typeof rawValue !== 'boolean') return NextResponse.json({ message: `${key} must be true or false` }, { status: 400 });
        updates[key] = rawValue;
        continue;
      }
      if (key === 'taxPercent') {
        const percent = Number(rawValue);
        if (!Number.isFinite(percent) || percent < 0 || percent > 100) return NextResponse.json({ message: 'taxPercent must be between 0 and 100' }, { status: 400 });
        updates[key] = Math.round(percent * 100) / 100;
        continue;
      }
      if (key === 'invoicePrefix') {
        if (typeof rawValue !== 'string') return NextResponse.json({ message: 'invoicePrefix must be text' }, { status: 400 });
        const prefix = rawValue.trim().toUpperCase();
        if (!/^[A-Z0-9_-]{1,16}$/.test(prefix)) return NextResponse.json({ message: 'Invoice prefix must contain 1 to 16 letters, numbers, hyphens or underscores' }, { status: 400 });
        updates[key] = prefix;
        continue;
      }
      if (key === 'companyLogo') {
        if (typeof rawValue !== 'string') return NextResponse.json({ message: 'companyLogo must be an image data URL or empty' }, { status: 400 });
        if (!rawValue) {
          updates[key] = '';
          continue;
        }
        const match = rawValue.match(/^data:image\/(png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/);
        if (!match) return NextResponse.json({ message: 'Logo must be a PNG or JPEG image' }, { status: 400 });
        const image = Buffer.from(match[2], 'base64');
        const isPng = match[1] === 'png' && image.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
        const isJpeg = match[1] === 'jpeg' && image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff;
        if (image.length === 0 || image.length > 512 * 1024 || (!isPng && !isJpeg)) {
          return NextResponse.json({ message: 'Logo must be a valid PNG or JPEG no larger than 512 KB' }, { status: 400 });
        }
        updates[key] = `data:image/${match[1]};base64,${image.toString('base64')}`;
        continue;
      }
      if (key === 'decimalDigits') {
        const digits = Number(rawValue);
        if (!Number.isInteger(digits) || digits < 0 || digits > 4) return NextResponse.json({ message: 'decimalDigits must be between 0 and 4' }, { status: 400 });
        updates[key] = digits;
        continue;
      }
      if (typeof rawValue !== 'string') return NextResponse.json({ message: `${key} must be text` }, { status: 400 });
      if (rawValue.length > 5000) return NextResponse.json({ message: `${key} is too long` }, { status: 400 });
      const value = rawValue.trim();
      if (key === 'themeMode' && !['light', 'dark'].includes(value)) return NextResponse.json({ message: 'Invalid theme mode' }, { status: 400 });
      if (key === 'themeBgColor' && !/^#[\da-f]{6}$/i.test(value)) return NextResponse.json({ message: 'Theme color must be a six-digit hex color' }, { status: 400 });
      if (key === 'currencyPosition' && !['prefix', 'suffix'].includes(value)) return NextResponse.json({ message: 'Invalid currency position' }, { status: 400 });
      if (key === 'timeFormat' && !['12h', '24h'].includes(value)) return NextResponse.json({ message: 'Invalid time format' }, { status: 400 });
      updates[key] = value;
    }

    const companyName = updates.companyName ?? currentCompany.name;
    const companyEmail = updates.companyEmail ?? currentCompany.email;
    if (!companyName.trim()) return NextResponse.json({ message: 'Company name is required' }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyEmail)) return NextResponse.json({ message: 'A valid company email is required' }, { status: 400 });
    for (const [key, [modelName]] of Object.entries(REFERENCE_KEYS)) {
      const value = updates[key];
      if (value === undefined || value === '') continue;
      const id = Number(value);
      if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ message: `${key} must be a valid id` }, { status: 400 });
      const record = await prisma[modelName].findFirst({ where: { id, companyId: user.companyId }, select: { id: true } });
      if (!record) return NextResponse.json({ message: `${key} record not found in this company` }, { status: 404 });
      updates[key] = String(record.id);
    }

    const merged = {
      ...settingsFor(currentCompany),
      ...updates,
      companyName: companyName.trim(),
      companyEmail: companyEmail.toLowerCase(),
      companyPhone: updates.companyPhone !== undefined ? updates.companyPhone : currentCompany.phone || '',
      companyAddress: updates.companyAddress !== undefined ? updates.companyAddress : currentCompany.address || '',
    };
    const company = await prisma.$transaction(async (tx) => {
      const updated = await tx.company.update({
        where: { id: currentCompany.id },
        data: {
          name: companyName.trim(),
          email: companyEmail.toLowerCase(),
          phone: updates.companyPhone !== undefined ? updates.companyPhone || null : currentCompany.phone,
          address: updates.companyAddress !== undefined ? updates.companyAddress || null : currentCompany.address,
          settings: merged,
        },
      });
      await writeAuditLog(tx, user, { action: 'update', entity: 'CompanySettings', entityId: currentCompany.id, details: { changedFields: Object.keys(updates) } });
      return updated;
    });
    return NextResponse.json({ message: 'Company settings saved', settings: settingsFor(company) });
  } catch (error) {
    if (error?.code === 'P2002') return NextResponse.json({ message: 'That company email is already in use' }, { status: 409 });
    console.error('PUT /api/settings error:', error);
    return NextResponse.json({ message: 'Unable to save company settings' }, { status: 500 });
  }
}
