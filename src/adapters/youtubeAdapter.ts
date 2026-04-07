import { BaseYtDlpAdapter } from './baseYtDlpAdapter';
import { PLATFORM_HOST_ALLOWLIST } from '../config/platforms';

export class YoutubeAdapter extends BaseYtDlpAdapter {
  readonly platform = 'youtube' as const;
  readonly hostnames = PLATFORM_HOST_ALLOWLIST['youtube'];
}
