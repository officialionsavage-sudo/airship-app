import { Injectable, signal } from '@angular/core';

const STORAGE_USERNAME = 'airship_admin_username';
const STORAGE_PASSWORD = 'airship_admin_password';
/** Previous session storage key — migrated once on read. */
const LEGACY_STORAGE_KEY = 'airship_admin_api_key';

export type AdminCredentials = { username: string; password: string };

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  /** Stored credentials sent as HTTP Basic on `/api/admin` when both are set. */
  readonly credentials = signal<AdminCredentials | null>(null);

  constructor() {
    if (typeof sessionStorage === 'undefined') {
      return;
    }
    const username = sessionStorage.getItem(STORAGE_USERNAME)?.trim() ?? '';
    let password = sessionStorage.getItem(STORAGE_PASSWORD)?.trim() ?? '';

    if (!password) {
      const legacy = sessionStorage.getItem(LEGACY_STORAGE_KEY)?.trim();
      if (legacy) {
        password = legacy;
        sessionStorage.setItem(STORAGE_PASSWORD, legacy);
        sessionStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }

    if (username && password) {
      this.credentials.set({ username, password });
    } else if (password || username) {
      sessionStorage.removeItem(STORAGE_USERNAME);
      sessionStorage.removeItem(STORAGE_PASSWORD);
      sessionStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  }

  setCredentials(username: string, password: string): void {
    const u = username.trim();
    const p = password.trim();
    sessionStorage.setItem(STORAGE_USERNAME, u);
    sessionStorage.setItem(STORAGE_PASSWORD, p);
    sessionStorage.removeItem(LEGACY_STORAGE_KEY);
    this.credentials.set({ username: u, password: p });
  }

  logout(): void {
    sessionStorage.removeItem(STORAGE_USERNAME);
    sessionStorage.removeItem(STORAGE_PASSWORD);
    sessionStorage.removeItem(LEGACY_STORAGE_KEY);
    this.credentials.set(null);
  }
}
