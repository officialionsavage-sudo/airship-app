import { ApplicationRef, DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LocaleService } from './locale.service';

type Dict = Record<string, unknown>;

function flatten(prefix: string, obj: Record<string, unknown>, out: Record<string, string>): void {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v != null && typeof v === 'object' && !Array.isArray(v)) {
      flatten(key, v as Record<string, unknown>, out);
    } else if (typeof v === 'string') {
      out[key] = v;
    }
  }
}

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly locale = inject(LocaleService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly appRef = inject(ApplicationRef);

  private flat: Record<string, string> = {};
  private fallbackFlat: Record<string, string> = {};

  /**
   * Bumped when JSON dictionaries finish loading. The translate pipe reads this so
   * OnPush components (e.g. footer) still refresh when `t()` starts returning real strings.
   */
  readonly i18nEpoch = signal(0);

  constructor() {
    this.reload();
    this.locale.locale$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.reload());
  }

  t(key: string): string {
    return this.flat[key] ?? this.fallbackFlat[key] ?? key;
  }

  private reload(): void {
    const loc = this.locale.locale;
    forkJoin({
      cur: this.http.get<Dict>(`assets/i18n/${loc}.json`).pipe(catchError(() => of({}))),
      en: loc === 'en' ? of<Dict>({}) : this.http.get<Dict>('assets/i18n/en.json').pipe(catchError(() => of({}))),
    })
      .pipe(
        map(({ cur, en }) => {
          const f1: Record<string, string> = {};
          const f2: Record<string, string> = {};
          flatten('', cur, f1);
          if (loc !== 'en') {
            flatten('', en, f2);
          }
          return { f1, f2 };
        }),
      )
      .subscribe(({ f1, f2 }) => {
        this.flat = f1;
        this.fallbackFlat = loc === 'en' ? f1 : f2;
        this.i18nEpoch.update((n) => n + 1);
        // Re-run change detection so `| t` and other bindings update app-wide without a full reload.
        this.appRef.tick();
      });
  }
}
