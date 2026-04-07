import { DownloadSelection, PreparedStreamResult, ResolvedMedia, SupportedPlatform } from '../models/types';

export interface PlatformAdapter {
  readonly platform: SupportedPlatform;
  canHandle(url: URL): boolean;
  resolve(url: string): Promise<ResolvedMedia>;
  download(selection: DownloadSelection): Promise<PreparedStreamResult>;
}
