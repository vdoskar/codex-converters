import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { env } from '../config/env';

export class TempFileService {
  async ensureTempDir(): Promise<string> {
    await fs.mkdir(env.TEMP_DIR, { recursive: true });
    return env.TEMP_DIR;
  }

  async createJobDir(): Promise<string> {
    const root = await this.ensureTempDir();
    const dir = path.join(root, randomUUID());
    await fs.mkdir(dir, { recursive: true });
    return dir;
  }

  async cleanup(paths: string[]): Promise<void> {
    await Promise.all(paths.map((p) => fs.rm(p, { recursive: true, force: true })));
  }
}
