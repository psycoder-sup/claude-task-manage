import { describe, it, expect } from 'vitest';
import { getRepoRoot, getRepoHash } from './repo.js';

describe('getRepoRoot', () => {
  it('returns the git root directory', async () => {
    const result = await getRepoRoot();
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('returns null for non-git directory', async () => {
    const result = await getRepoRoot('/tmp');
    expect(result).toBeNull();
  });
});

describe('getRepoHash', () => {
  it('returns consistent hash for same path', () => {
    const hash1 = getRepoHash('/some/repo/path');
    const hash2 = getRepoHash('/some/repo/path');
    expect(hash1).toBe(hash2);
  });

  it('returns different hashes for different paths', () => {
    const hash1 = getRepoHash('/some/repo/path');
    const hash2 = getRepoHash('/other/repo/path');
    expect(hash1).not.toBe(hash2);
  });

  it('returns a sha256 hash', () => {
    const hash = getRepoHash('/some/repo/path');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
