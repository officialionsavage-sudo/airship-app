import { Injectable, signal } from '@angular/core';

type AdminConfirmPayload = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  resolve: (v: boolean) => void;
};

@Injectable({ providedIn: 'root' })
export class AdminConfirmService {
  private readonly _dialog = signal<AdminConfirmPayload | null>(null);
  readonly dialog = this._dialog.asReadonly();

  open(opts: {
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
  }): Promise<boolean> {
    return new Promise((resolve) => {
      this._dialog.set({
        title: opts.title ?? 'Please confirm',
        message: opts.message,
        confirmLabel: opts.confirmLabel ?? 'Continue',
        cancelLabel: opts.cancelLabel ?? 'Cancel',
        resolve,
      });
    });
  }

  close(ok: boolean): void {
    const d = this._dialog();
    if (d) {
      d.resolve(ok);
      this._dialog.set(null);
    }
  }
}
