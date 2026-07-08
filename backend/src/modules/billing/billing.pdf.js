// billing.pdf.js — Pure JavaScript PDF generator (no external dependencies)
// Generates a professional invoice PDF using raw PDF 1.4 format

const PW = 595; // A4 width in points
const PH = 842; // A4 height in points

// Color palette
const C = {
  headerBg:   '#1a1a2e',
  headerText: '#ffffff',
  headerSub:  '#8892b0',
  accent:     '#4f8ef7',
  boxBg:      '#eef2ff',
  tableHead:  '#f1f5f9',
  tableAlt:   '#f8fafc',
  dark:       '#1e293b',
  muted:      '#64748b',
  divider:    '#cbd5e1',
  success:    '#16a34a',
  danger:     '#dc2626',
  warning:    '#d97706',
  white:      '#ffffff',
};

const STATUS_LABELS = {
  borrador:      'BORRADOR',
  emitida:       'PENDIENTE',
  pagada:        'PAGADA',
  pagada_parcial:'PAGO PARCIAL',
  anulada:       'ANULADA',
};

const STATUS_COLORS = {
  borrador:       C.muted,
  emitida:        C.warning,
  pagada:         C.success,
  pagada_parcial: C.warning,
  anulada:        C.danger,
};

// Convert hex color to PDF float RGB string
function h2r(hex) {
  const h = hex.replace('#', '');
  const r = (parseInt(h.slice(0, 2), 16) / 255).toFixed(3);
  const g = (parseInt(h.slice(2, 4), 16) / 255).toFixed(3);
  const b = (parseInt(h.slice(4, 6), 16) / 255).toFixed(3);
  return `${r} ${g} ${b}`;
}

// Escape a string for PDF content streams
function ps(s) {
  return String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

// Truncate a string to max length with ellipsis
function tr(s, n) {
  s = String(s ?? '');
  return s.length > n ? s.slice(0, n - 1) + '...' : s;
}

// Format a number as currency
function fmt(n) {
  return '$' + parseFloat(n ?? 0).toFixed(2);
}

// Format date for display (long form)
function dateStr(d) {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleDateString('es-PE', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  } catch { return String(d); }
}

// Format date for display (short form)
function shortDate(d) {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleDateString('es-PE');
  } catch { return String(d); }
}

// PDF content stream builder
class Pdf {
  constructor() {
    this.ops = [];
  }

  // Set fill color
  fg(hex) {
    this.ops.push(`${h2r(hex)} rg`);
    return this;
  }

  // Set stroke color
  sg(hex) {
    this.ops.push(`${h2r(hex)} RG`);
    return this;
  }

  // Line width
  lw(w) {
    this.ops.push(`${w} w`);
    return this;
  }

  // Filled rectangle. x,y = top-left in screen coords (y down from top)
  fillRect(x, y, w, h, color) {
    this.fg(color);
    // PDF rect bottom-left = screen (x, y+h) converted to PDF coords
    this.ops.push(`${x.toFixed(1)} ${(PH - y - h).toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)} re f`);
    return this;
  }

  // Horizontal line at screen y
  hline(x1, x2, y, color = C.divider, lineWidth = 0.5) {
    this.sg(color);
    this.lw(lineWidth);
    this.ops.push(`${x1.toFixed(1)} ${(PH - y).toFixed(1)} m ${x2.toFixed(1)} ${(PH - y).toFixed(1)} l S`);
    return this;
  }

  // Draw text. x,y = where baseline appears in screen coords.
  // font: 'F1' (Helvetica), 'F2' (Helvetica-Bold)
  txt(str, x, y, font = 'F1', size = 9, color = C.dark) {
    const safe = ps(tr(String(str ?? ''), 120));
    this.fg(color);
    this.ops.push(`BT /${font} ${size} Tf ${x.toFixed(1)} ${(PH - y).toFixed(1)} Td (${safe}) Tj ET`);
    return this;
  }

  // Get the full content stream as a string
  stream() {
    return this.ops.join('\n');
  }
}

// Compile content stream into a complete PDF buffer
function compile(contentStream) {
  const objs = [
    '1 0 obj\n<</Type /Catalog /Pages 2 0 R>>\nendobj',
    '2 0 obj\n<</Type /Pages /Kids [3 0 R] /Count 1>>\nendobj',
    `3 0 obj\n<</Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}]\n  /Contents 4 0 R /Resources <</Font <</F1 5 0 R /F2 6 0 R>>>>>>\nendobj`,
    `4 0 obj\n<</Length ${Buffer.byteLength(contentStream, 'latin1')}>>\nstream\n${contentStream}\nendstream\nendobj`,
    '5 0 obj\n<</Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding>>\nendobj',
    '6 0 obj\n<</Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding>>\nendobj',
  ];

  let body = '%PDF-1.4\n';
  const offsets = [];

  for (const obj of objs) {
    offsets.push(Buffer.byteLength(body, 'latin1'));
    body += obj + '\n';
  }

  const xrefStart = Buffer.byteLength(body, 'latin1');
  body += 'xref\n0 7\n';
  body += '0000000000 65535 f \n';
  for (let i = 0; i < 6; i++) {
    body += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }
  body += `trailer\n<</Size 7 /Root 1 0 R>>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return Buffer.from(body, 'latin1');
}

// ─── Main export ─────────────────────────────────────────────────────────────
export async function generateInvoicePdf(data) {
  const p = new Pdf();
  const clinic     = data.clinic ?? {};
  const clinicName = clinic.clinic_name    || 'Vet Pets David';
  const clinicAddr = clinic.clinic_address || '';
  const clinicTel  = clinic.clinic_phone   || '';
  const clinicMail = clinic.clinic_email   || '';

  const M  = 40;          // margin
  const IW = PW - M * 2; // inner width

  // ── HEADER ────────────────────────────────────────────────────────────────
  const headerH = 108;
  p.fillRect(0, 0, PW, headerH, C.headerBg);

  // Clinic name (large, left)
  p.txt(clinicName, M, 36, 'F2', 21, C.headerText);
  p.txt('COMPROBANTE DE ATENCION VETERINARIA', M, 52, 'F1', 7.5, C.headerSub);

  // Clinic details (right side)
  let ry = 26;
  const rx = PW - M - 195;
  if (clinicAddr) { p.txt(tr(clinicAddr, 36), rx, ry, 'F1', 7.5, C.headerSub); ry += 12; }
  if (clinicTel)  { p.txt(`Tel: ${clinicTel}`, rx, ry, 'F1', 7.5, C.headerSub); ry += 12; }
  if (clinicMail) { p.txt(tr(clinicMail, 32), rx, ry, 'F1', 7.5, C.headerSub); ry += 12; }

  // ── DIVIDER ───────────────────────────────────────────────────────────────
  p.hline(M, PW - M, headerH + 16, C.divider, 0.5);

  // ── CLIENT + INVOICE INFO ──────────────────────────────────────────────────
  const sectY  = headerH + 28;
  const col1W  = 275;
  const col2X  = M + col1W + 14;
  const col2W  = PW - M - col2X;

  // --- Left: Client
  p.txt('DATOS DEL CLIENTE', M, sectY, 'F1', 7, C.muted);
  p.txt(tr(data.client_name || '-', 36), M, sectY + 15, 'F2', 11, C.dark);

  let cy = sectY + 30;
  if (data.client_dni)   { p.txt(`DNI: ${data.client_dni}`,       M, cy, 'F1', 8, C.muted); cy += 12; }
  if (data.client_phone) { p.txt(`Tel: ${data.client_phone}`,     M, cy, 'F1', 8, C.muted); cy += 12; }
  if (data.client_email) { p.txt(tr(data.client_email, 36),       M, cy, 'F1', 8, C.muted); cy += 12; }
  if (data.pet_name) {
    const pet = `Mascota: ${data.pet_name}${data.pet_species ? ` (${data.pet_species})` : ''}`;
    p.txt(pet, M, cy, 'F1', 8, C.muted);
  }

  // --- Right: Invoice box
  const boxH = 88;
  p.fillRect(col2X, sectY - 4, col2W, boxH, C.boxBg);
  p.txt(data.invoice_number || '-', col2X + 10, sectY + 14, 'F2', 14, C.accent);
  p.txt('Fecha de emision:', col2X + 10, sectY + 31, 'F1', 7.5, C.muted);
  p.txt(dateStr(data.issue_date), col2X + 10, sectY + 43, 'F1', 8.5, C.dark);

  // Status badge
  const statusLabel = STATUS_LABELS[data.status] || String(data.status || '').toUpperCase();
  const statusColor = STATUS_COLORS[data.status] || C.muted;
  p.fillRect(col2X + 10, sectY + 51, 92, 16, statusColor);
  p.txt(statusLabel, col2X + 14, sectY + 63, 'F2', 7.5, C.white);

  // ── ITEMS TABLE ───────────────────────────────────────────────────────────
  const tableY = sectY + boxH + 18;
  const rowH   = 18;

  // Column positions
  const cDesc  = M;                              const wDesc  = IW * 0.40;
  const cQty   = M + wDesc;                     const wQty   = IW * 0.09;
  const cPrice = M + wDesc + wQty;              const wPrice = IW * 0.15;
  const cDisc  = M + wDesc + wQty + wPrice;     const wDisc  = IW * 0.13;
  const cSub   = M + wDesc + wQty + wPrice + wDisc; // const wSub = IW * 0.15;

  // Table header row
  p.fillRect(M, tableY, IW, rowH, C.tableHead);
  const hY = tableY + 13;
  p.txt('Descripcion', cDesc + 4, hY, 'F2', 8, C.dark);
  p.txt('Cant.',       cQty  + 4, hY, 'F2', 8, C.dark);
  p.txt('P. Unit.',    cPrice + 4, hY, 'F2', 8, C.dark);
  p.txt('Descuento',   cDisc + 4, hY, 'F2', 8, C.dark);
  p.txt('Subtotal',    cSub  + 4, hY, 'F2', 8, C.dark);

  const items = data.items ?? [];
  let iY = tableY + rowH;

  items.forEach((item, i) => {
    if (i % 2 === 1) p.fillRect(M, iY, IW, rowH, C.tableAlt);
    const tY = iY + 12;
    p.txt(tr(item.description || '-', 30), cDesc  + 4, tY, 'F1', 8.5, C.dark);
    p.txt(String(item.quantity ?? 1),      cQty   + 4, tY, 'F1', 8.5, C.dark);
    p.txt(fmt(item.unit_price),            cPrice + 4, tY, 'F1', 8.5, C.dark);
    p.txt(parseFloat(item.discount) > 0 ? fmt(item.discount) : '-', cDisc + 4, tY, 'F1', 8.5, C.dark);
    p.txt(fmt(item.subtotal),              cSub   + 4, tY, 'F1', 8.5, C.dark);
    iY += rowH;
  });

  if (items.length === 0) {
    p.txt('Sin items registrados.', M + 4, iY + 12, 'F1', 8.5, C.muted);
    iY += rowH;
  }

  // Divider
  p.hline(M, PW - M, iY + 6, C.divider, 0.5);
  iY += 16;

  // Totals block (positioned on right side)
  const tLX = PW - M - 175; // label x
  const tVX = PW - M - 55;  // value x

  function totalRow(label, value, bold = false, color = null) {
    const f   = bold ? 'F2' : 'F1';
    const sz  = bold ? 11 : 9;
    const col = color ?? (bold ? C.dark : C.muted);
    p.txt(label, tLX, iY, f, sz, col);
    p.txt(value, tVX, iY, f, sz, col);
    iY += bold ? 15 : 13;
  }

  totalRow('Subtotal:', fmt(data.subtotal));
  if (parseFloat(data.discount_amount ?? 0) > 0) {
    totalRow('Descuento:', `-${fmt(data.discount_amount)}`);
  }
  if (parseFloat(data.tax_amount ?? 0) > 0) {
    totalRow('Impuesto:', fmt(data.tax_amount));
  }

  p.hline(tLX, PW - M, iY - 2, C.divider, 0.5);
  iY += 4;
  totalRow('TOTAL:', fmt(data.total), true);

  // ── PAYMENTS SECTION ─────────────────────────────────────────────────────
  const payments = data.payments ?? [];
  if (payments.length > 0) {
    iY += 14;
    p.txt('PAGOS RECIBIDOS', M, iY, 'F1', 7.5, C.muted);
    iY += 14;

    const pH = 15;
    p.fillRect(M, iY, IW * 0.88, pH, C.tableHead);
    p.txt('Fecha',    M +   4, iY + 10, 'F2', 7.5, C.dark);
    p.txt('Metodo',   M + 100, iY + 10, 'F2', 7.5, C.dark);
    p.txt('Referencia', M + 220, iY + 10, 'F2', 7.5, C.dark);
    p.txt('Monto',    M + 370, iY + 10, 'F2', 7.5, C.dark);
    iY += pH;

    let totalPaid = 0;
    payments.forEach((pay, i) => {
      if (i % 2 === 1) p.fillRect(M, iY, IW * 0.88, 13, C.tableAlt);
      totalPaid += parseFloat(pay.amount ?? 0);
      const pY = iY + 10;
      p.txt(shortDate(pay.payment_date),             M +   4, pY, 'F1', 7.5, C.dark);
      p.txt(tr(pay.payment_method_name || '-', 18),  M + 100, pY, 'F1', 7.5, C.dark);
      p.txt(tr(pay.reference_number || '-', 20),     M + 220, pY, 'F1', 7.5, C.dark);
      p.txt(fmt(pay.amount),                         M + 370, pY, 'F1', 7.5, C.dark);
      iY += 13;
    });

    iY += 8;
    p.txt(`Total pagado: ${fmt(totalPaid)}`, M, iY, 'F2', 9, C.success);
    iY += 14;
    const balance = parseFloat(data.total ?? 0) - totalPaid;
    if (balance > 0.01) {
      p.txt(`Saldo pendiente: ${fmt(balance)}`, M, iY, 'F2', 9, C.danger);
    } else {
      p.txt('Saldo: $0.00 - Factura saldada', M, iY, 'F1', 8.5, C.muted);
    }
  }

  // ── FOOTER ────────────────────────────────────────────────────────────────
  const fY = PH - 52;
  p.hline(M, PW - M, fY, C.divider, 0.5);

  let generated = '-';
  try {
    generated = new Date().toLocaleString('es-PE', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch {}

  p.txt(`Gracias por confiar en ${clinicName}`, M, fY + 14, 'F2', 9, C.muted);
  p.txt('Este documento es un comprobante de atencion veterinaria.', M, fY + 27, 'F1', 7.5, C.muted);
  p.txt(`Generado el ${generated}`, M, fY + 39, 'F1', 7.5, C.muted);

  return compile(p.stream());
}
