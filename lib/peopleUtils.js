// Shared helpers for the People module (customers / suppliers / billers)

export async function readJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_RE = /^[+()\-\s\d]{6,20}$/;

export function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function cellText(col, row) {
  const v = col.text ? col.text(row) : row[col.key];
  return v === null || v === undefined ? '' : String(v);
}

const normalize = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function buildTable(columns, rows) {
  const head = columns.map((c) => c.label);
  const body = rows.map((r) => columns.map((c) => cellText(c, r)));
  return { head, body };
}

function downloadName(base) {
  return `${base}-${new Date().toISOString().slice(0, 10)}`;
}

export async function exportPdf({ title, columns, rows, fileName }) {
  const [{ jsPDF }, autoTableMod] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const autoTable = autoTableMod.default;
  const { head, body } = buildTable(columns, rows);

  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(14);
  doc.text(title, 14, 15);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 21);

  autoTable(doc, {
    startY: 26,
    head: [head],
    body,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [44, 99, 230] },
  });
  doc.save(`${downloadName(fileName)}.pdf`);
}

export async function exportExcel({ title, columns, rows, fileName }) {
  const XLSX = await import('xlsx');
  const { head, body } = buildTable(columns, rows);
  const ws = XLSX.utils.aoa_to_sheet([head, ...body]);
  ws['!cols'] = head.map((h, i) => ({
    wch: Math.min(40, Math.max(h.length, ...body.map((r) => String(r[i] ?? '').length)) + 2),
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 28) || 'Sheet1');
  XLSX.writeFile(wb, `${downloadName(fileName)}.xlsx`);
}

export function printTable({ title, columns, rows }) {
  const { head, body } = buildTable(columns, rows);
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:24px}
h1{font-size:18px;margin:0 0 4px}
p{font-size:11px;color:#555;margin:0 0 14px}
table{width:100%;border-collapse:collapse;font-size:11px}
th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
th{background:#f0f2f6}
</style></head><body>
<h1>${escapeHtml(title)}</h1>
<p>Printed: ${escapeHtml(new Date().toLocaleString())}</p>
<table><thead><tr>${head.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>
<tbody>${body
    .map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c || '—')}</td>`).join('')}</tr>`)
    .join('')}</tbody></table></body></html>`;

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => iframe.remove(), 1500);
  }, 250);
}

// Reads the first sheet of an .xlsx / .xls / .csv file and maps columns to API fields.
// importFields: [{ field, label, type? }]
export async function parseImportFile(file, importFields) {
  const XLSX = await import('xlsx');
  const wb = XLSX.read(await file.arrayBuffer());
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(ws, { defval: '' });

  return raw
    .map((row) => {
      const keyMap = {};
      Object.keys(row).forEach((k) => {
        keyMap[normalize(k)] = row[k];
      });
      const out = {};
      importFields.forEach((f) => {
        const val = keyMap[normalize(f.field)] ?? keyMap[normalize(f.label)] ?? '';
        const str = String(val).trim();
        out[f.field] = f.type === 'number' ? (str === '' || isNaN(Number(str)) ? null : Number(str)) : str;
      });
      return out;
    })
    .filter((r) => Object.values(r).some((v) => v !== '' && v !== null));
}
