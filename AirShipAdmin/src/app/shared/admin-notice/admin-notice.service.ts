import { Injectable, signal } from '@angular/core';

export type AdminNoticeKind = 'success' | 'error' | 'info';

@Injectable({ providedIn: 'root' })
export class AdminNoticeService {
  private readonly _notice = signal<{ kind: AdminNoticeKind; text: string } | null>(null);
  readonly notice = this._notice.asReadonly();

  private timer?: ReturnType<typeof setTimeout>;

  show(kind: AdminNoticeKind, text: string, durationMs = 6500): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this._notice.set({ kind, text });
    if (durationMs > 0) {
      this.timer = setTimeout(() => this.dismiss(), durationMs);
    }
  }

  success(text: string, durationMs = 6500): void {
    this.show('success', text, durationMs);
  }

  error(text: string, durationMs = 9500): void {
    this.show('error', text, durationMs);
  }

  info(text: string, durationMs = 6500): void {
    this.show('info', text, durationMs);
  }

  dismiss(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    this._notice.set(null);
  }
}
