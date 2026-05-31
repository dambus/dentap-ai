/**
 * Normalizuje srpski tekst za pretragu — zamenjuje dijakritike ASCII ekvivalentima.
 * ć/Ć → c, č/Č → c, ž/Ž → z, š/Š → s, đ/Đ → dj
 *
 * Mora biti identično SQL funkciji normalize_sr() u migraciji baze.
 */
export function normalizeSr(text: string): string {
  return text
    .replace(/Š/g, 'S').replace(/š/g, 's')
    .replace(/Č/g, 'C').replace(/č/g, 'c')
    .replace(/Ć/g, 'C').replace(/ć/g, 'c')
    .replace(/Ž/g, 'Z').replace(/ž/g, 'z')
    .replace(/Đ/g, 'DJ').replace(/đ/g, 'dj')
    .toLowerCase()
}
