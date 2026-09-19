import { describe, expect, it } from 'vitest';
import { friendlyFormError } from './errors';

describe('friendlyFormError', () => {
  it('surfaces the friendly text from a rate-limit trigger', () => {
    expect(friendlyFormError({ message: 'rate_limited: too many messages from this address, please try again later' }, 'x'))
      .toBe('Too many messages from this address, please try again later.');
  });

  it('explains constraint violations', () => {
    expect(friendlyFormError({ code: '23514', message: 'violates check constraint' }, 'x')).toMatch(/check your email/i);
  });

  it('falls back for anything else', () => {
    expect(friendlyFormError({ message: 'network down' }, 'Try again')).toBe('Try again');
    expect(friendlyFormError(null, 'Try again')).toBe('Try again');
  });
});
