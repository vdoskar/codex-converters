import fs from 'node:fs';
import { MAX_OUTPUT_BYTES } from '../config/env';
import { DownloadSelection, OutputType, ResolvedMedia } from '../models/types';
import { HistoryRepository } from '../repositories/historyRepository';
import { AdapterRegistry } from './adapterRegistry';
import { TempFileService } from './tempFileService';
import { nowIso } from '../utils/time';
import { parseAndValidateUrl } from '../utils/url';

export class MediaService {
  constructor(
    private readonly adapterRegistry = new AdapterRegistry(),
    private readonly historyRepo = new HistoryRepository(),
    private readonly tempFileService = new TempFileService(),
  ) {}

  async resolve(inputUrl: string): Promise<ResolvedMedia> {
    const validated = parseAndValidateUrl(inputUrl);
    const adapter = this.adapterRegistry.resolveByUrl(validated);
    try {
      const resolved = await adapter.resolve(validated.toString());
      await this.historyRepo.createResolution({
        ...baseRecord(validated.toString()),
        platform: resolved.platform,
        title: resolved.title,
        author: resolved.author,
        duration: resolved.durationSeconds,
        thumbnailUrl: resolved.thumbnailUrl,
        availableFormats: resolved.availableVariants.map((x) => `${x.id}:${x.qualityLabel}`),
        status: 'resolved',
      });
      return resolved;
    } catch (error) {
      await this.historyRepo.createResolution({
        ...baseRecord(validated.toString()),
        status: 'failed',
        errorMessage: getErrorMessage(error),
      });
      throw error;
    }
  }

  async download(input: {
    originalUrl: string;
    selectedOutputType: OutputType;
    selectedQuality: string;
    title?: string;
  }): Promise<{
    stream: fs.ReadStream;
    fileName: string;
    contentType: string;
    contentLength: number;
    cleanup: () => Promise<void>;
    platform: string;
  }> {
    const validated = parseAndValidateUrl(input.originalUrl);
    const adapter = this.adapterRegistry.resolveByUrl(validated);
    const selection: DownloadSelection = {
      originalUrl: validated.toString(),
      platform: adapter.platform,
      selectedOutputType: input.selectedOutputType,
      selectedQuality: input.selectedQuality,
      title: input.title,
    };

    try {
      const prepared = await adapter.download(selection);
      if (prepared.fileSizeBytes > MAX_OUTPUT_BYTES) {
        throw new Error('Result exceeds 500 MB limit.');
      }

      await this.historyRepo.createDownload({
        ...baseRecord(validated.toString()),
        platform: adapter.platform,
        title: input.title,
        selectedOutputType: input.selectedOutputType,
        selectedQuality: input.selectedQuality,
        fileSize: prepared.fileSizeBytes,
        status: 'completed',
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      });

      return {
        stream: fs.createReadStream(prepared.filePath),
        fileName: prepared.fileName,
        contentType: prepared.contentType,
        contentLength: prepared.fileSizeBytes,
        cleanup: () => this.tempFileService.cleanup(prepared.cleanupPaths),
        platform: adapter.platform,
      };
    } catch (error) {
      await this.historyRepo.createDownload({
        ...baseRecord(validated.toString()),
        platform: adapter.platform,
        title: input.title,
        selectedOutputType: input.selectedOutputType,
        selectedQuality: input.selectedQuality,
        status: 'failed',
        errorMessage: getErrorMessage(error),
      });
      throw error;
    }
  }

  async listHistory() {
    return this.historyRepo.listHistory();
  }
}

function baseRecord(originalUrl: string) {
  const now = nowIso();
  return {
    originalUrl,
    createdAt: now,
    updatedAt: now,
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}
