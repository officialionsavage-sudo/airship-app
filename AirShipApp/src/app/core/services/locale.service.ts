import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CMS_LOCALES, type CmsLocale } from '../models/home-page.models';

const STORAGE_KEY = 'airship.locale';

function readStoredLocale(platformId: object): CmsLocale {
  if (!isPlatformBrowser(platformId)) {
    return 'en';
  }
  const raw = localStorage.getItem(STORAGE_KEY)?.trim().toLowerCase();
  if (raw && (CMS_LOCALES as readonly string[]).includes(raw)) {
    return raw as CmsLocale;
  }
  return 'en';
}

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly subject: BehaviorSubject<CmsLocale>;

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {
    this.subject = new BehaviorSubject<CmsLocale>(readStoredLocale(platformId));
  }

  get locale(): CmsLocale {
    return this.subject.value;
  }

  get locale$() {
    return this.subject.asObservable();
  }

  setLocale(next: CmsLocale): void {
    if (this.subject.value === next) {
      return;
    }
    this.subject.next(next);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, next);
    }
  }
}
