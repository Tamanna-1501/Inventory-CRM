import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/apiAuth';

export async function GET() {
  const user = await getUserFromRequest();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  if (user.isSuperAdmin || !user.companyId) return NextResponse.json({ message: 'Company access required' }, { status: 403 });

  try {
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: { name: true, email: true, phone: true, address: true, settings: true },
    });
    if (!company) return NextResponse.json({ message: 'Company not found' }, { status: 404 });
    const settings = company.settings && typeof company.settings === 'object' && !Array.isArray(company.settings) ? company.settings : {};

    // Sirf invoice branding fields response me bhejo.
    return NextResponse.json({
      companyName: company.name,
      companyEmail: company.email,
      companyPhone: company.phone || '',
      companyAddress: company.address || '',
      companyLogo: typeof settings.companyLogo === 'string' ? settings.companyLogo : '',
      footerText: typeof settings.footerText === 'string' ? settings.footerText : '',
      taxPercent: Number.isFinite(Number(settings.taxPercent)) ? Number(settings.taxPercent) : 0,
      currencySymbol: typeof settings.currencySymbol === 'string' ? settings.currencySymbol : '₹',
      currencyCode: typeof settings.currencyCode === 'string' ? settings.currencyCode : 'INR',
      currencyPosition: settings.currencyPosition === 'suffix' ? 'suffix' : 'prefix',
      decimalDigits: Number.isInteger(settings.decimalDigits) ? settings.decimalDigits : 2,
    });
  } catch (error) {
    console.error('GET /api/company/branding error:', error);
    return NextResponse.json({ message: 'Unable to load company invoice settings' }, { status: 500 });
  }
}
