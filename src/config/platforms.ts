import { SupportedPlatform } from '../models/types';

export const PLATFORM_HOST_ALLOWLIST: Record<SupportedPlatform, string[]> = {
  instagram: ['instagram.com', 'www.instagram.com'],
  x: ['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'],
  tiktok: ['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com'],
  youtube: ['youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com'],
  facebook: ['facebook.com', 'www.facebook.com', 'fb.watch', 'm.facebook.com'],
};

export const SUPPORTED_HOSTS = new Set(Object.values(PLATFORM_HOST_ALLOWLIST).flat());
