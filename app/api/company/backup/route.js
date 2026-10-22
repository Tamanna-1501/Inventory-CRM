import { NextResponse } from 'next/server';
import { authorizeAdmin } from '@/lib/apiAuth';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/auditLog';
import { ExportLimitError, getCompanyBackupData } from '@/lib/companyBackup';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const { user, error } = await authorizeAdmin();
    if (error) return error;

    const backup = await getCompanyBackupData(user.companyId);
    const exportedAt = new Date().toISOString();
    const json = JSON.stringify({ format: 'inventual-company-backup', version: 1, exportedAt, ...backup }, null, 2);
    await writeAuditLog(prisma, user, {
      action: 'backup',
      entity: 'CompanyData',
      entityId: user.companyId,
      details: { format: 'json', bytes: Buffer.byteLength(json, 'utf8'), tableCount: Object.keys(backup.tables).length },
    });

    return new NextResponse(json, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="inventual-company-${user.companyId}-backup.json"`,
        'Cache-Control': 'private, no-store, max-age=0',
      },
    });
  } catch (error) {
    if (error instanceof ExportLimitError) return NextResponse.json({ message: error.message }, { status: 413 });
    console.error('GET /api/company/backup error:', error);
    return NextResponse.json({ message: 'Unable to create company backup' }, { status: 500 });
  }
}
