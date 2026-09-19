import { describe, expect, it } from 'vitest';
import { shouldReport } from './monitoring';

describe('shouldReport', () => {
  it('ignores empty messages and known browser noise', () => {
    expect(shouldReport('')).toBe(false);
    expect(shouldReport('ResizeObserver loop completed with undelivered notifications.')).toBe(false);
    expect(shouldReport('Script error.')).toBe(false);
  });

  it('reports real errors', () => {
    expect(shouldReport("Cannot read properties of undefined (reading 'name')")).toBe(true);
  });
});
