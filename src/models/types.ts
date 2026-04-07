export type SupportedPlatform = 'instagram' | 'x' | 'tiktok' | 'youtube' | 'facebook';
export type OutputType = 'mp4' | 'mp3';
export type OperationStatus = 'pending' | 'resolved' | 'downloading' | 'completed' | 'failed' | 'blocked';

export interface MediaVariant {
  id: string;
  qualityLabel: string;
  ext: string;
  fps?: number;
  width?: number;
  height?: number;
  estimatedSizeBytes?: number;
  hasAudio: boolean;
  hasVideo: boolean;
}

export interface ResolvedMedia {
  originalUrl: string;
  platform: SupportedPlatform;
  title?: string;
  author?: string;
  durationSeconds?: number;
  thumbnailUrl?: string;
  availableVariants: MediaVariant[];
  resolvedAt: string;
}

export interface DownloadSelection {
  originalUrl: string;
  platform: SupportedPlatform;
  selectedOutputType: OutputType;
  selectedQuality: string;
  title?: string;
}

export interface PreparedStreamResult {
  filePath: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  cleanupPaths: string[];
}

export interface OperationRecord {
  originalUrl: string;
  platform?: SupportedPlatform;
  title?: string;
  author?: string;
  duration?: number;
  thumbnailUrl?: string;
  availableFormats?: string[];
  selectedOutputType?: OutputType;
  selectedQuality?: string;
  status: OperationStatus;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
  expiresAt?: string;
}
