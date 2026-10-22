import { NextResponse } from 'next/server';
import { authorizeAdmin } from '@/lib/apiAuth';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/auditLog';
import { createCompanyWorkbook, ExportLimitError, getCompanyBackupData } from '@/lib/companyBackup';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const { user, error } = await authorizeAdmin();
    if (error) return error;

    const backup = await getCompanyBackupData(user.companyId);
    const buffer = await createCompanyWorkbook(backup);
    const rowCounts = Object.fromEntries(Object.entries(backup.tables).map(([name, rows]) => [name, rows.length]));
    await writeAuditLog(prisma, user, {
      action: 'export',
      entity: 'CompanyData',
      entityId: user.companyId,
      details: { format: 'xlsx', rowCounts },
    });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="inventual-company-${user.companyId}-export.xlsx"`,
        'Cache-Control': 'private, no-store, max-age=0',
      },
    });
  } catch (error) {
    if (error instanceof ExportLimitError) return NextResponse.json({ message: error.message }, { status: 413 });
    console.error('GET /api/company/export error:', error);
    return NextResponse.json({ message: 'Unable to export company data' }, { status: 500 });
  }
}
