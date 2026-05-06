/**
 * Normaliza un nombre para comparación deduplicada.
 * Cubre: tildes, mayúsculas, espacios múltiples y guiones intermedios.
 *
 * Ejemplos:
 *   "María García"   → "maria garcia"
 *   "MARIA  GARCIA"  → "maria garcia"
 *   "maría   garcía" → "maria garcia"
 *   "Juan-Carlos"    → "juan-carlos"
 */
export function normalizarNombre(nombre: string): string {
  return nombre
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")  // elimina tildes y diacríticos
    .replace(/\s+/g, " ");            // colapsa espacios múltiples
}

/**
 * Detecta si dos nombres son probablemente la misma persona.
 * Comparación sobre la forma normalizada.
 */
export function sonMismoNombre(a: string, b: string): boolean {
  return normalizarNombre(a) === normalizarNombre(b);
}
