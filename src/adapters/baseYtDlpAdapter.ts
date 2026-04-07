import fs from 'node:fs/promises';
import path from 'node:path';
import sanitize from 'sanitize-filename';
import { MAX_OUTPUT_BYTES } from '../config/env';
import { DownloadSelection, MediaVariant, PreparedStreamResult, ResolvedMedia, SupportedPlatform } from '../models/types';
import { FfmpegClient } from '../media/ffmpegClient';
import { TempFileService } from '../services/tempFileService';
import { YtDlpClient } from '../media/ytDlpClient';
import { PlatformAdapter } from './types';

export abstract class BaseYtDlpAdapter implements PlatformAdapter {
  abstract readonly platform: SupportedPlatform;
  abstract readonly hostnames: string[];

  constructor(
    protected readonly ytDlp = new YtDlpClient(),
    protected readonly ffmpeg = new FfmpegClient(),
    protected readonly tempFileService = new TempFileService(),
  ) {}

  canHandle(url: URL): boolean {
    return this.hostnames.includes(url.hostname.toLowerCase());
  }

  async resolve(url: string): Promise<ResolvedMedia> {
    const meta = await this.ytDlp.probe(url);
    const variants: MediaVariant[] = (meta.formats ?? [])
      .filter((f: any) => f.vcodec !== 'none' || f.acodec !== 'none')
      .map((f: any) => ({
        id: String(f.format_id),
        qualityLabel: String(f.format_note || f.resolution || f.height || f.format_id),
        ext: String(f.ext || ''),
        fps: f.fps,
        width: f.width,
        height: f.height,
        estimatedSizeBytes: f.filesize ?? f.filesize_approx,
        hasAudio: f.acodec && f.acodec !== 'none',
        hasVideo: f.vcodec && f.vcodec !== 'none',
      }))
      .filter((v: MediaVariant) => v.hasVideo || v.hasAudio);

    return {
      originalUrl: url,
      platform: this.platform,
      title: meta.title,
      author: meta.uploader ?? meta.channel,
      durationSeconds: meta.duration,
      thumbnailUrl: meta.thumbnail,
      availableVariants: variants,
      resolvedAt: new Date().toISOString(),
    };
  }

  async download(selection: DownloadSelection): Promise<PreparedStreamResult> {
    const jobDir = await this.tempFileService.createJobDir();
    const baseName = sanitize(selection.title || `${selection.platform}-${Date.now()}`) || `media-${Date.now()}`;

    const sourceTemplate = path.join(jobDir, `${baseName}.%(ext)s`);
    const selector = selection.selectedOutputType === 'mp4' ? selection.selectedQuality : 'bestaudio';
    await this.ytDlp.download(selection.originalUrl, selector, sourceTemplate);

    const files = await fs.readdir(jobDir);
    const sourceFile = files.map((f) => path.join(jobDir, f)).sort()[0];
    if (!sourceFile) {
      throw new Error('Downloaded file not found.');
    }

    let outputPath = sourceFile;
    let outputExt = path.extname(sourceFile).replace('.', '') || 'mp4';

    if (selection.selectedOutputType === 'mp3') {
      outputPath = path.join(jobDir, `${baseName}.mp3`);
      await this.ffmpeg.convertToMp3(sourceFile, outputPath);
      outputExt = 'mp3';
    }

    const stat = await fs.stat(outputPath);
    if (stat.size > MAX_OUTPUT_BYTES) {
      throw new Error('Result exceeds 500 MB limit.');
    }

    return {
      filePath: outputPath,
      fileName: `${baseName}.${outputExt}`,
      contentType: selection.selectedOutputType === 'mp4' ? 'video/mp4' : 'audio/mpeg',
      fileSizeBytes: stat.size,
      cleanupPaths: [jobDir],
    };
  }
}
