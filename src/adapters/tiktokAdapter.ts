import { BaseYtDlpAdapter } from './baseYtDlpAdapter';
import { PLATFORM_HOST_ALLOWLIST } from '../config/platforms';

export class TiktokAdapter extends BaseYtDlpAdapter {
  readonly platform = 'tiktok' as const;
  readonly hostnames = PLATFORM_HOST_ALLOWLIST['tiktok'];
}
