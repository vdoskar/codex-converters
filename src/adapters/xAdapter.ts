import { BaseYtDlpAdapter } from './baseYtDlpAdapter';
import { PLATFORM_HOST_ALLOWLIST } from '../config/platforms';

export class XAdapter extends BaseYtDlpAdapter {
  readonly platform = 'x' as const;
  readonly hostnames = PLATFORM_HOST_ALLOWLIST['x'];
}
