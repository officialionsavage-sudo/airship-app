import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastVariant = 'success' | 'error';

export interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

const DEFAULT_DURATION_MS = 5200;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  private readonly pendingTimers = new Map<number, ReturnType<typeof globalThis.setTimeout>>();

  readonly toasts$ = new BehaviorSubject<ToastItem[]>([]);

  success(message: string, durationMs: number = DEFAULT_DURATION_MS): void {
    this.push({ message, variant: 'success' }, durationMs);
  }

  error(message: string, durationMs: number = DEFAULT_DURATION_MS): void {
    this.push({ message, variant: 'error' }, durationMs);
  }

  dismiss(id: number): void {
    const t = this.pendingTimers.get(id);
    if (t != null) {
      globalThis.clearTimeout(t);
      this.pendingTimers.delete(id);
    }
    this.toasts$.next(this.toasts$.value.filter((item) => item.id !== id));
  }

  private push(partial: Omit<ToastItem, 'id'>, durationMs: number): void {
    const item: ToastItem = { id: ++this.seq, ...partial };
    this.toasts$.next([...this.toasts$.value, item]);
    const timer = globalThis.setTimeout(() => this.dismiss(item.id), durationMs);
    this.pendingTimers.set(item.id, timer);
  }
}
