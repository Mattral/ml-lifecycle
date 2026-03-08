import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/lib/storage';

describe('storage utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns fallback when key does not exist', () => {
    expect(getLocalStorage('missing', 'default')).toBe('default');
  });

  it('stores and retrieves values', () => {
    setLocalStorage('key', { foo: 'bar' });
    expect(getLocalStorage('key', null)).toEqual({ foo: 'bar' });
  });

  it('stores booleans', () => {
    setLocalStorage('flag', true);
    expect(getLocalStorage('flag', false)).toBe(true);
  });

  it('removes values', () => {
    setLocalStorage('key', 'value');
    removeLocalStorage('key');
    expect(getLocalStorage('key', 'fallback')).toBe('fallback');
  });

  it('returns fallback on corrupted data', () => {
    localStorage.setItem('bad', '{invalid json');
    expect(getLocalStorage('bad', 'safe')).toBe('safe');
  });

  it('handles storage being unavailable', () => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = () => { throw new Error('QuotaExceeded'); };
    
    // Should not throw
    expect(() => setLocalStorage('key', 'value')).not.toThrow();
    
    Storage.prototype.setItem = originalSetItem;
  });
});
