import { BaseYtDlpAdapter } from './baseYtDlpAdapter';
import { PLATFORM_HOST_ALLOWLIST } from '../config/platforms';

export class InstagramAdapter extends BaseYtDlpAdapter {
  readonly platform = 'instagram' as const;
  readonly hostnames = PLATFORM_HOST_ALLOWLIST['instagram'];
}
