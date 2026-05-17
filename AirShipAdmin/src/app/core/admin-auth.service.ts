import { Injectable, computed, signal } from '@angular/core';

const STORAGE_USERNAME = 'airship_admin_username';
const STORAGE_PASSWORD = 'airship_admin_password';
const STORAGE_ROLE = 'airship_admin_role';
/** Previous session storage key — migrated once on read. */
const LEGACY_STORAGE_KEY = 'airship_admin_api_key';

export type AdminRole = 'admin' | 'spectator';

export type AdminCredentials = { username: string; password: string };

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  /** Stored credentials sent as HTTP Basic on `/api/admin` when both are set. */
  readonly credentials = signal<AdminCredentials | null>(null);
  readonly role = signal<AdminRole>('admin');

  readonly canWrite = computed(() => this.role() === 'admin');
  readonly isReadOnly = computed(() => this.role() === 'spectator');

  constructor() {
    if (typeof sessionStorage === 'undefined') {
      return;
    }
    const username = sessionStorage.getItem(STORAGE_USERNAME)?.trim() ?? '';
    let password = sessionStorage.getItem(STORAGE_PASSWORD)?.trim() ?? '';
    const storedRole = sessionStorage.getItem(STORAGE_ROLE)?.trim();

    if (!password) {
      const legacy = sessionStorage.getItem(LEGACY_STORAGE_KEY)?.trim();
      if (legacy) {
        password = legacy;
        sessionStorage.setItem(STORAGE_PASSWORD, legacy);
        sessionStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }

    if (storedRole === 'admin' || storedRole === 'spectator') {
      this.role.set(storedRole);
    }

    if (username && password) {
      this.credentials.set({ username, password });
    } else if (password || username) {
      sessionStorage.removeItem(STORAGE_USERNAME);
      sessionStorage.removeItem(STORAGE_PASSWORD);
      sessionStorage.removeItem(STORAGE_ROLE);
      sessionStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  }

  setSession(username: string, password: string, role: AdminRole): void {
    const u = username.trim();
    const p = password.trim();
    sessionStorage.setItem(STORAGE_USERNAME, u);
    sessionStorage.setItem(STORAGE_PASSWORD, p);
    sessionStorage.setItem(STORAGE_ROLE, role);
    sessionStorage.removeItem(LEGACY_STORAGE_KEY);
    this.credentials.set({ username: u, password: p });
    this.role.set(role);
  }

  /** @deprecated Use setSession after login */
  setCredentials(username: string, password: string): void {
    this.setSession(username, password, 'admin');
  }

  applyRole(role: AdminRole): void {
    sessionStorage.setItem(STORAGE_ROLE, role);
    this.role.set(role);
  }

  logout(): void {
    sessionStorage.removeItem(STORAGE_USERNAME);
    sessionStorage.removeItem(STORAGE_PASSWORD);
    sessionStorage.removeItem(STORAGE_ROLE);
    sessionStorage.removeItem(LEGACY_STORAGE_KEY);
    this.credentials.set(null);
    this.role.set('admin');
  }
}
