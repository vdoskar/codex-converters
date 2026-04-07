import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from '../config/env';

export class CleanupService {
  async cleanupOldTempDirs(maxAgeMs = 6 * 60 * 60 * 1000): Promise<number> {
    await fs.mkdir(env.TEMP_DIR, { recursive: true });
    const entries = await fs.readdir(env.TEMP_DIR, { withFileTypes: true });
    const now = Date.now();
    let removed = 0;
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const fullPath = path.join(env.TEMP_DIR, entry.name);
      const stat = await fs.stat(fullPath);
      if (now - stat.mtimeMs > maxAgeMs) {
        await fs.rm(fullPath, { recursive: true, force: true });
        removed++;
      }
    }
    return removed;
  }
}
