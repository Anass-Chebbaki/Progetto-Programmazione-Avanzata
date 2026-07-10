// CREAZIONE .CSV (SOLO  PARTECIPANTI)
//=====================================
// Serializzazione CSV (RFC 4180): un campo che contiene virgola, virgolette o newline
// viene racchiuso tra virgolette doppie, e le virgolette interne vengono raddoppiate.

type CsvValue = string | number | boolean;

function escapeField(value: CsvValue): string {
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCsv(headers: string[], rows: CsvValue[][]): string {
  const lines = [headers.map(escapeField).join(',')];
  for (const row of rows) {
    lines.push(row.map(escapeField).join(','));
  }
  return lines.join('\n');
}