import { execSync } from 'child_process';
import * as crypto from 'crypto';

export async function getRepoRoot(cwd?: string): Promise<string | null> {
  try {
    const result = execSync('git rev-parse --show-toplevel', {
      cwd: cwd || process.cwd(),
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return result.trim();
  } catch {
    return null;
  }
}

export function getRepoHash(repoPath: string): string {
  return crypto.createHash('sha256').update(repoPath).digest('hex');
}
