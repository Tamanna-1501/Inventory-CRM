// Shared invoice helpers: normalize data, print, download PDF
const num = (n) => Number(n || 0);
const fmt = (n, digits = 2) => num(n).toFixed(digits);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const safeBranding = (branding = {}) => ({
  companyName: branding.companyName || 'Inventual',
  companyEmail: branding.companyEmail || '',
  companyPhone: branding.companyPhone || '',
  companyAddress: branding.companyAddress || '',
  companyLogo: branding.companyLogo || '',
  footerText: branding.footerText || '',
  currencySymbol: branding.currencySymbol || '₹',
  currencyCode: branding.currencyCode || 'INR',
  currencyPosition: branding.currencyPosition === 'suffix' ? 'suffix' : 'prefix',
  decimalDigits: Number.isInteger(branding.decimalDigits) && branding.decimalDigits >= 0 && branding.decimalDigits <= 4 ? branding.decimalDigits : 2,
});

export function formatInvoiceMoney(value, branding = {}) {
  const config = safeBranding(branding);
  const amount = fmt(value, config.decimalDigits);
  return config.currencyPosition === 'suffix' ? `${amount} ${config.currencySymbol}` : `${config.currencySymbol} ${amount}`;
}

export function normalizeInvoice(type, d, branding = {}) {
  const company = safeBranding(branding);
  if (type === 'purchase') {
    const raw = d.items || d.purchaseItems || [];
    let lines = raw.map((i) => {
      const qty = num(i.quantity ?? i.qty);
      const price = num(i.price ?? i.unitCost ?? i.cost);
      return { desc: i.product?.name || i.name || 'Item', qty, price, total: num(i.total ?? qty * price) };
    });
    if (!lines.length) lines = [{ desc: 'Purchase total', qty: 1, price: num(d.totalAmount), total: num(d.totalAmount) }];
    return {
      ...company,
      title: 'PURCHASE INVOICE',
      number: d.reference || `PUR-${d.id}`,
      date: new Date(d.createdAt).toLocaleDateString(),
      partyLabel: 'Supplier',
      party: d.supplier?.name || '—',
      warehouse: d.warehouse?.name || '—',
      lines,
      total: num(d.totalAmount),
      paid: num(d.totalPaid),
      due: num(d.due),
      status: d.paymentStatus || '',
    };
  }

  const amount = num(d.amount);
  return {
    ...company,
    title: 'EXPENSE INVOICE',
    number: d.voucherNo || d.reference || `EXP-${d.id}`,
    date: new Date(d.date).toLocaleDateString(),
    partyLabel: 'Category',
    party: d.category?.name || '—',
    warehouse: d.warehouse?.name || '—',
    lines: [{ desc: d.description || d.category?.name || 'Expense', qty: 1, price: amount, total: amount }],
    total: amount,
    paid: amount - num(d.due),
    due: num(d.due),
    status: d.paymentStatus || '',
  };
}

export function invoiceHtml(inv) {
  const rows = inv.lines.map((line, index) =>
    `<tr><td>${index + 1}</td><td>${esc(line.desc)}</td><td class="r">${line.qty}</td><td class="r">${esc(formatInvoiceMoney(line.price, inv))}</td><td class="r">${esc(formatInvoiceMoney(line.total, inv))}</td></tr>`
  ).join('');
  const logo = inv.companyLogo ? `<img class="logo" src="${esc(inv.companyLogo)}" alt="Company logo">` : '';
  const contact = [inv.companyAddress, inv.companyPhone, inv.companyEmail].filter(Boolean).map(esc).join('<br>');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(inv.number)}</title>
<style>
 body{font-family:Arial,sans-serif;color:#222;padding:32px} header{display:flex;align-items:flex-start;gap:18px;border-bottom:1px solid #ddd;padding-bottom:14px} .logo{max-width:110px;max-height:70px;object-fit:contain} h1{margin:0 0 4px} .muted{color:#666;font-size:13px;line-height:1.5}
 .meta{display:flex;justify-content:space-between;margin:20px 0} table{width:100%;border-collapse:collapse;margin-top:10px} th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:14px} th{background:#f0f0f0} .r{text-align:right}
 .tot{width:300px;margin-left:auto;margin-top:16px;font-size:14px}.tot div{display:flex;justify-content:space-between;padding:4px 0}.tot .b{font-weight:bold;border-top:1px solid #333;margin-top:4px;padding-top:8px} footer{text-align:center;color:#666;font-size:12px;margin-top:32px;white-space:pre-wrap}
</style></head><body>
 <header>${logo}<div><h1>${esc(inv.companyName)}</h1>${contact ? `<div class="muted">${contact}</div>` : ''}<div style="margin-top:12px"><b>${esc(inv.title)}</b><div class="muted">Invoice No: ${esc(inv.number)}</div></div></div>
 <div style="margin-left:auto;text-align:right"><b>${esc(inv.partyLabel)}:</b> ${esc(inv.party)}<br><b>Warehouse:</b> ${esc(inv.warehouse)}<br><b>Date:</b> ${esc(inv.date)}<br><b>Status:</b> ${esc(inv.status)}</div></header>
 <table><thead><tr><th>#</th><th>Description</th><th class="r">Qty</th><th class="r">Price</th><th class="r">Total</th></tr></thead><tbody>${rows}</tbody></table>
 <div class="tot"><div><span>Total</span><span>${esc(formatInvoiceMoney(inv.total, inv))}</span></div><div><span>Paid</span><span>${esc(formatInvoiceMoney(inv.paid, inv))}</span></div><div class="b"><span>Due</span><span>${esc(formatInvoiceMoney(inv.due, inv))}</span></div></div>
 ${inv.footerText ? `<footer>${esc(inv.footerText)}</footer>` : ''}
</body></html>`;
}

export function printInvoice(inv) {
  const w = window.open('', '_blank', 'width=900,height=700');
  if (!w) return alert('Popup blocked. Please allow popups for this site.');
  w.document.write(invoiceHtml(inv));
  w.document.close();
  w.focus();
  w.onload = () => w.print();
  setTimeout(() => { try { w.print(); } catch {} }, 500);
}

export async function downloadInvoicePdf(inv) {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF();
  const config = safeBranding(inv);
  const money = (value) => `${config.currencyCode} ${fmt(value, config.decimalDigits)}`;
  let headingY = 18;

  if (/^data:image\/(png|jpeg);base64,/.test(inv.companyLogo || '')) {
    try {
      const imageType = inv.companyLogo.startsWith('data:image/png') ? 'PNG' : 'JPEG';
      const image = doc.getImageProperties(inv.companyLogo);
      const ratio = Math.min(34 / image.width, 22 / image.height);
      doc.addImage(inv.companyLogo, imageType, 14, 10, image.width * ratio, image.height * ratio);
      headingY = 18;
    } catch { /* Invalid logo should not stop invoice PDF generation. */ }
  }

  const textX = inv.companyLogo ? 54 : 14;
  doc.setFontSize(16);
  doc.text(inv.companyName, textX, headingY);
  doc.setFontSize(9);
  const companyLines = [inv.companyAddress, inv.companyPhone, inv.companyEmail].filter(Boolean);
  if (companyLines.length) doc.text(companyLines, textX, headingY + 6);
  const invoiceY = Math.max(headingY + 12 + companyLines.length * 4, 36);
  doc.setFontSize(13);
  doc.text(inv.title, 14, invoiceY);
  doc.setFontSize(9);
  doc.text(`Invoice No: ${inv.number}`, 14, invoiceY + 7);
  doc.text(`${inv.partyLabel}: ${inv.party}`, 14, invoiceY + 14);
  doc.text(`Warehouse: ${inv.warehouse}`, 14, invoiceY + 20);
  doc.text(`Date: ${inv.date}`, 140, invoiceY + 14);
  doc.text(`Status: ${inv.status}`, 140, invoiceY + 20);

  autoTable(doc, {
    startY: invoiceY + 27,
    head: [['#', 'Description', 'Qty', 'Price', 'Total']],
    body: inv.lines.map((line, index) => [index + 1, line.desc, line.qty, money(line.price), money(line.total)]),
    headStyles: { fillColor: [0, 112, 243] },
  });

  let y = doc.lastAutoTable.finalY + 10;
  if (y > 255) { doc.addPage(); y = 20; }
  doc.text(`Total: ${money(inv.total)}`, 140, y);
  doc.text(`Paid: ${money(inv.paid)}`, 140, y + 6);
  doc.setFont(undefined, 'bold');
  doc.text(`Due: ${money(inv.due)}`, 140, y + 12);
  if (inv.footerText) {
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.text(doc.splitTextToSize(inv.footerText, 180), 14, Math.min(y + 24, 280));
  }
  doc.save(`${inv.number}.pdf`);
}
