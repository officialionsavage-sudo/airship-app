import type { AdminAuthService } from './admin-auth.service';
import type { AdminNoticeService } from '../shared/admin-notice/admin-notice.service';

/** Returns true when the user may mutate data; false after showing a read-only notice. */
export function requireWriteAccess(
  auth: AdminAuthService,
  notice?: AdminNoticeService,
): boolean {
  if (auth.canWrite()) {
    return true;
  }
  notice?.error('Read-only account: you can view data but cannot make changes.');
  return false;
}
