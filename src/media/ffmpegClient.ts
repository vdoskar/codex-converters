import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { env } from '../config/env';

const execFileAsync = promisify(execFile);

export class FfmpegClient {
  async convertToMp3(inputPath: string, outputPath: string): Promise<void> {
    await execFileAsync(
      env.FFMPEG_BIN,
      ['-y', '-i', inputPath, '-vn', '-codec:a', 'libmp3lame', '-b:a', '192k', outputPath],
      { timeout: env.REQUEST_TIMEOUT_MS },
    );
  }
}
