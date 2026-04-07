import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { env } from '../config/env';

const execFileAsync = promisify(execFile);

export class YtDlpClient {
  async probe(url: string): Promise<any> {
    const { stdout } = await execFileAsync(
      env.YTDLP_BIN,
      ['--dump-single-json', '--no-playlist', '--no-download', url],
      { timeout: env.REQUEST_TIMEOUT_MS, maxBuffer: 10 * 1024 * 1024 },
    );
    return JSON.parse(stdout);
  }

  async download(url: string, formatSelector: string, outputTemplate: string): Promise<void> {
    await execFileAsync(
      env.YTDLP_BIN,
      ['--no-playlist', '-f', formatSelector, '-o', outputTemplate, url],
      { timeout: env.REQUEST_TIMEOUT_MS },
    );
  }
}
