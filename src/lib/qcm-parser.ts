/**
 * Parses raw text into question answers map.
 * Supports:
 * - "1: A,B 2: C 3: D,E"
 * - "1. AC 2. B 3. DE"
 * - "Q1: A\nQ2: B\nQ3: CD"
 * - Sequential list: "A, BC, D, E, AB"
 */
export function parseAnswersText(
  text: string,
  maxQuestions = 200
): Record<number, string[]> {
  const result: Record<number, string[]> = {};
  if (!text || !text.trim()) return result;

  const cleaned = text.trim();

  // Pattern 1: Numbered answers e.g. "1: AC" or "Q1. B" or "1 - ADE"
  const numberedRegex = /(?:Q|q)?\s*(\d{1,3})\s*[:.\-)\/]\s*([A-Ea-e,\s]+)/g;
  let match: RegExpExecArray | null;
  let foundAnyNumbered = false;

  while ((match = numberedRegex.exec(cleaned)) !== null) {
    foundAnyNumbered = true;
    const qNum = parseInt(match[1], 10);
    if (qNum > 0 && qNum <= maxQuestions) {
      const letters = match[2]
        .toUpperCase()
        .replace(/[^A-E]/g, "")
        .split("")
        .filter((v, i, a) => a.indexOf(v) === i);
      if (letters.length > 0) {
        result[qNum] = letters.sort();
      }
    }
  }

  if (foundAnyNumbered && Object.keys(result).length > 0) {
    return result;
  }

  // Pattern 2: Sequential list separated by newlines, commas, or semicolons
  const tokens = cleaned
    .split(/[\n,;]+/)
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);

  let currentQuestion = 1;
  for (const token of tokens) {
    if (currentQuestion > maxQuestions) break;
    const letters = token
      .replace(/[^A-E]/g, "")
      .split("")
      .filter((v, i, a) => a.indexOf(v) === i);
    if (letters.length > 0) {
      result[currentQuestion] = letters.sort();
    }
    currentQuestion++;
  }

  return result;
}
