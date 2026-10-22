import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission, authorize } from '@/lib/apiAuth';
import { createTransfer } from '@/lib/transferStock';

const MAX_ROWS = 500;
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const STATUSES = ['pending', 'completed', 'rejected'];
const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const TEMPLATE_HEADERS = [
  'Date',
  'Reference',
  'Product SKU',
  'Quantity',
  'From Warehouse',
  'To Warehouse',
  'Reason',
  'Authorized By',
  'Status',
  'Note',
];

// Excel cell ki value alag-alag shape mein aa sakti hai (formula, hyperlink, rich text, date)
function cellValue(value) {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value;
  if (typeof value === 'object') {
    if ('result' in value) return cellValue(value.result);
    if ('richText' in value) return value.richText.map((r) => r.text).join('');
    if ('text' in value) return String(value.text);
    return '';
  }
  return value;
}

const asText = (value) => (value instanceof Date ? '' : String(value ?? '').trim());

// GET: import template download
export async function GET() {
  try {
    const { user, error } = await authorize('transfer', 'view');
    if (error) return error;

    const workbook = new ExcelJS.Workbook();

    const sheet = workbook.addWorksheet('Transfers');
    sheet.addRow(TEMPLATE_HEADERS);
    sheet.addRow([
      '2026-09-28',
      '',
      'SKU-001',
      10,
      'Warehouse 1',
      'Warehouse 2',
      'Stock Rebalancing',
      'Emily Johnson',
      'pending',
      'Optional note',
    ]);
    sheet.getRow(1).font = { bold: true };
    sheet.columns.forEach((col) => {
      col.width = 18;
    });

    const help = workbook.addWorksheet('Instructions');
    [
      'Ek row = ek transfer (ek product). Pehli sheet "Transfers" mein data bharo.',
      'Required columns: Product SKU, Quantity, From Warehouse, To Warehouse.',
      'Product SKU aur warehouse ka naam system mein jaisa hai bilkul waisa likho.',
      'Date: YYYY-MM-DD (khali chhodo toh aaj ki date). Status: pending, completed ya rejected (khali = pending).',
      'Reference khali chhodo toh auto-generate hoga.',
      'Status "completed" wali row par stock turant move ho jata hai.',
      'Example row (SKU-001) ko delete kar dena, warna wo "product not found" error degi.',
    ].forEach((line) => help.addRow([line]));
    help.getColumn(1).width = 110;

    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': XLSX_TYPE,
        'Content-Disposition': 'attachment; filename="transfer-import-template.xlsx"',
      },
    });
  } catch (error) {
    console.error('GET /api/transfers/import error:', error);
    return NextResponse.json({ message: error.message || 'Something went wrong' }, { status: 500 });
  }
}

// POST: .xlsx file se transfers import karo
export async function POST(request) {
  try {
    const user = await getUserFromRequest();
    if (!user || !hasPermission(user, 'transfer', 'add')) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ message: 'Please choose a file' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ message: 'File is too large (max 2 MB)' }, { status: 400 });
    }
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      return NextResponse.json({ message: 'Only .xlsx files are supported' }, { status: 400 });
    }

    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(Buffer.from(await file.arrayBuffer()));
    } catch {
      return NextResponse.json(
        { message: 'Could not read this file. Please use the template (.xlsx)' },
        { status: 400 }
      );
    }

    const sheet = workbook.worksheets[0];
    if (!sheet || sheet.actualRowCount < 2) {
      return NextResponse.json({ message: 'The file has no data rows' }, { status: 400 });
    }
    if (sheet.actualRowCount - 1 > MAX_ROWS) {
      return NextResponse.json({ message: `Too many rows (max ${MAX_ROWS})` }, { status: 400 });
    }

    // Header row -> column number
    const columns = {};
    sheet.getRow(1).eachCell((cell, colNumber) => {
      columns[asText(cellValue(cell.value)).toLowerCase()] = colNumber;
    });
    if (!columns['product sku'] && columns['sku']) columns['product sku'] = columns['sku'];

    const missing = ['product sku', 'quantity', 'from warehouse', 'to warehouse'].filter(
      (h) => !columns[h]
    );
    if (missing.length) {
      return NextResponse.json(
        { message: `Missing column(s): ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    const [products, warehouses] = await Promise.all([
      prisma.product.findMany({ where: { companyId: user.companyId }, select: { id: true, sku: true } }),
      prisma.warehouse.findMany({ where: { companyId: user.companyId }, select: { id: true, name: true } }),
    ]);
    const productBySku = new Map(products.map((p) => [p.sku.trim().toLowerCase(), p.id]));
    const warehousesByName = new Map();
    for (const w of warehouses) {
      const key = w.name.trim().toLowerCase();
      warehousesByName.set(key, [...(warehousesByName.get(key) || []), w.id]);
    }

    const resolveWarehouse = (name, label) => {
      if (!name) throw new Error(`${label} is required`);
      const ids = warehousesByName.get(name.toLowerCase());
      if (!ids) throw new Error(`${label} "${name}" not found`);
      if (ids.length > 1) throw new Error(`${label} "${name}" matches more than one warehouse`);
      return ids[0];
    };

    const get = (row, header) =>
      columns[header] ? cellValue(row.getCell(columns[header]).value) : '';

    let created = 0;
    const failed = [];

    // Row by row process hota hai, taaki ek galat row baaki ko na roke
    for (let r = 2; r <= sheet.rowCount; r += 1) {
      const row = sheet.getRow(r);
      const sku = asText(get(row, 'product sku'));
      const qtyRaw = get(row, 'quantity');
      const fromName = asText(get(row, 'from warehouse'));
      const toName = asText(get(row, 'to warehouse'));

      if (!sku && qtyRaw === '' && !fromName && !toName) continue; // khali row

      try {
        const productId = productBySku.get(sku.toLowerCase());
        if (!productId) throw new Error(`Product SKU "${sku}" not found`);

        const quantity = Number(qtyRaw);
        if (!Number.isInteger(quantity) || quantity <= 0) {
          throw new Error('Quantity must be a whole number above 0');
        }

        const fromWarehouseId = resolveWarehouse(fromName, 'From Warehouse');
        const toWarehouseId = resolveWarehouse(toName, 'To Warehouse');
        if (fromWarehouseId === toWarehouseId) {
          throw new Error('From and To warehouse must be different');
        }

        const status = (asText(get(row, 'status')) || 'pending').toLowerCase();
        if (!STATUSES.includes(status)) throw new Error(`Invalid status "${status}"`);

        const dateRaw = get(row, 'date');
        let date = new Date();
        if (dateRaw instanceof Date) {
          date = dateRaw;
        } else if (asText(dateRaw)) {
          date = new Date(asText(dateRaw));
          if (Number.isNaN(date.getTime())) throw new Error(`Invalid date "${asText(dateRaw)}"`);
        }

        await createTransfer({
          companyId: user.companyId,
          date,
          reference: asText(get(row, 'reference')),
          fromWarehouseId,
          toWarehouseId,
          items: [{ productId, quantity }],
          reason: asText(get(row, 'reason')),
          authorizedBy: asText(get(row, 'authorized by')),
          status,
          note: asText(get(row, 'note')),
          actor: user,
        });
        created += 1;
      } catch (err) {
        failed.push({
          row: r,
          message: err.code === 'P2002' ? 'Reference already exists' : err.message,
        });
      }
    }

    return NextResponse.json({ created, failed });
  } catch (error) {
    console.error('POST /api/transfers/import error:', error);
    return NextResponse.json({ message: error.message || 'Something went wrong' }, { status: 500 });
  }
}
