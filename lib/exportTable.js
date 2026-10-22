// Generic list export: print + PDF (npm i jspdf jspdf-autotable)
const esc = (s) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function printTable({ title, columns, rows }) {
  const head = columns.map((c) => `<th>${esc(c)}</th>`).join('');
  const body = rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
 body{font-family:Arial,sans-serif;color:#222;padding:24px}
 h2{margin:0 0 4px} .muted{color:#666;font-size:12px;margin-bottom:14px}
 table{width:100%;border-collapse:collapse}
 th,td{border:1px solid #ddd;padding:8px;font-size:13px;text-align:left}
 th{background:#f0f0f0}
</style></head><body>
 <h2>${esc(title)}</h2>
 <div class="muted">Printed on ${new Date().toLocaleString()} · ${rows.length} record(s)</div>
 <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
</body></html>`;

  const w = window.open('', '_blank', 'width=1000,height=700');
  if (!w) return alert('Popup blocked. Please allow popups for this site.');
  w.document.write(html);
  w.document.close();
  w.focus();
  w.onload = () => w.print();
  setTimeout(() => { try { w.print(); } catch {} }, 500);
}

export async function downloadTablePdf({ title, columns, rows, filename }) {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(16);
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  doc.text(`Generated on ${new Date().toLocaleString()} - ${rows.length} record(s)`, 14, 22);
  autoTable(doc, {
    startY: 27,
    head: [columns],
    // default PDF font has no ₹ glyph
    body: rows.map((r) => r.map((c) => String(c ?? '').replace(/₹/g, 'Rs. '))),
    headStyles: { fillColor: [0, 112, 243] },
    styles: { fontSize: 9 },
  });
  doc.save(`${filename || title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
}