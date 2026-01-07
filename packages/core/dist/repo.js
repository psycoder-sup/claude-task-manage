import { execSync } from 'child_process';
import * as crypto from 'crypto';
export async function getRepoRoot(cwd) {
    try {
        const result = execSync('git rev-parse --show-toplevel', {
            cwd: cwd || process.cwd(),
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        return result.trim();
    }
    catch {
        return null;
    }
}
export function getRepoHash(repoPath) {
    return crypto.createHash('sha256').update(repoPath).digest('hex');
}
//# sourceMappingURL=repo.js.map