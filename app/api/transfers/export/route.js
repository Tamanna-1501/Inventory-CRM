import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { prisma } from '@/lib/prisma';
import { authorize } from '@/lib/apiAuth';

const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const statusLabel = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// POST { ids: [1, 2, 3] } -> wahi transfers Excel mein (list mein jo filter dikh raha hai)
export async function POST(request) {
  try {
    const { user, error } = await authorize('transfer', 'view');
    if (error) return error;

    const body = await request.json().catch(() => ({}));
    const ids = Array.isArray(body.ids) ? body.ids.map(Number).filter(Boolean) : [];
    if (!ids.length) {
      return NextResponse.json({ message: 'Nothing to export' }, { status: 400 });
    }

    const transfers = await prisma.transfer.findMany({
      where: { companyId: user.companyId, id: { in: ids } },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        items: { include: { product: true } },
      },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Transfers');
    sheet.addRow([
      'Date',
      'Reference',
      'Product',
      'Product SKU',
      'Quantity',
      'From Warehouse',
      'To Warehouse',
      'Reason',
      'Authorized By',
      'Status',
      'Note',
    ]);

    // Ek item = ek row
    for (const t of transfers) {
      for (const item of t.items) {
        sheet.addRow([
          t.date.toISOString().slice(0, 10),
          t.reference || `TRF-${String(t.id).padStart(6, '0')}`,
          item.product?.name || '',
          item.product?.sku || '',
          item.quantity,
          t.fromWarehouse?.name || '',
          t.toWarehouse?.name || '',
          t.reason || '',
          t.authorizedBy || '',
          statusLabel(t.status),
          t.note || '',
        ]);
      }
    }

    sheet.getRow(1).font = { bold: true };
    sheet.columns.forEach((col) => {
      col.width = 18;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': XLSX_TYPE,
        'Content-Disposition': 'attachment; filename="transfers.xlsx"',
      },
    });
  } catch (error) {
    console.error('POST /api/transfers/export error:', error);
    return NextResponse.json({ message: error.message || 'Something went wrong' }, { status: 500 });
  }
}
