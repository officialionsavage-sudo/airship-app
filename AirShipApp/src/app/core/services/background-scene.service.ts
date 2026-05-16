import { DestroyRef, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export type SceneMode = 'home' | 'city' | 'listing' | 'detail' | 'offers' | 'contact' | 'transfer';

@Injectable({ providedIn: 'root' })
export class BackgroundSceneService {
  readonly routeDepth = signal(0);
  readonly sceneMode = signal<SceneMode>('home');

  constructor(router: Router, destroyRef: DestroyRef) {
    this.applyRouteState(router.url);

    router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((event) => this.applyRouteState(event.urlAfterRedirects));
  }

  private applyRouteState(url: string): void {
    if (url === '/' || url === '') {
      this.sceneMode.set('home');
      this.routeDepth.set(0);
      return;
    }

    if (url.startsWith('/offers')) {
      this.sceneMode.set('offers');
      this.routeDepth.set(0.72);
      return;
    }

    if (url.startsWith('/contact-us')) {
      this.sceneMode.set('contact');
      this.routeDepth.set(0.76);
      return;
    }

    if (url.startsWith('/transfer')) {
      this.sceneMode.set('transfer');
      this.routeDepth.set(0.45);
      return;
    }

    if (url.includes('/unit/') || /\/city\/[^/]+\/tours\/[^/]+/.test(url) || /\/city\/[^/]+\/real-estate\/[^/]+$/.test(url)) {
      this.sceneMode.set('detail');
      this.routeDepth.set(0.9);
      return;
    }

    if (url.includes('/real-estate') || /\/city\/[^/]+\/tours$/.test(url)) {
      this.sceneMode.set('listing');
      this.routeDepth.set(0.62);
      return;
    }

    this.sceneMode.set('city');
    this.routeDepth.set(0.3);
  }
}
