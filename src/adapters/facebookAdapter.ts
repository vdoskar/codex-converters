import { BaseYtDlpAdapter } from './baseYtDlpAdapter';
import { PLATFORM_HOST_ALLOWLIST } from '../config/platforms';

export class FacebookAdapter extends BaseYtDlpAdapter {
  readonly platform = 'facebook' as const;
  readonly hostnames = PLATFORM_HOST_ALLOWLIST['facebook'];
}
