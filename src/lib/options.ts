/** "S, M, L" → ['S', 'M', 'L'] — trims, drops blanks and case-insensitive duplicates, keeps order. */
export function parseOptionList(input: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of input.split(/[,\n]/)) {
    const value = raw.trim();
    const key = value.toLowerCase();
    if (value && !seen.has(key)) {
      seen.add(key);
      out.push(value);
    }
  }
  return out;
}

export function formatOptionList(options: string[]): string {
  return options.join(', ');
}
