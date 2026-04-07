import { FacebookAdapter } from '../adapters/facebookAdapter';
import { InstagramAdapter } from '../adapters/instagramAdapter';
import { TiktokAdapter } from '../adapters/tiktokAdapter';
import { XAdapter } from '../adapters/xAdapter';
import { YoutubeAdapter } from '../adapters/youtubeAdapter';
import { PlatformAdapter } from '../adapters/types';

export class AdapterRegistry {
  private readonly adapters: PlatformAdapter[] = [
    new InstagramAdapter(),
    new XAdapter(),
    new TiktokAdapter(),
    new YoutubeAdapter(),
    new FacebookAdapter(),
  ];

  resolveByUrl(url: URL): PlatformAdapter {
    const adapter = this.adapters.find((candidate) => candidate.canHandle(url));
    if (!adapter) {
      throw new Error('No adapter for this URL.');
    }
    return adapter;
  }
}
