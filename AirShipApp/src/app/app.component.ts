import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { animate, query, style, transition, trigger } from '@angular/animations';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { LocaleService } from './core/services/locale.service';
import { BreadcrumbComponent } from './shared/components/breadcrumb/breadcrumb.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { AppPreloaderComponent } from './shared/components/app-preloader/app-preloader.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { WhatsappButtonComponent } from './shared/components/whatsapp-button/whatsapp-button.component';
import { ToastStackComponent } from './shared/components/toast-stack/toast-stack.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    BreadcrumbComponent,
    AppPreloaderComponent,
    WhatsappButtonComponent,
    ToastStackComponent,
  ],
  template: `
    <app-preloader></app-preloader>
    <div class="app-shell">
      <div class="header-slot">
        <app-navbar></app-navbar>
      </div>
      <main class="main-content">
        <app-breadcrumb *ngIf="showBreadcrumb$ | async"></app-breadcrumb>
        <section class="page-wrap">
          <div class="route-host" [@routeTransition]="getRouteKey(outlet)">
            <router-outlet #outlet="outlet"></router-outlet>
          </div>
        </section>
      </main>
      <div class="footer-slot">
        <app-footer></app-footer>
      </div>
      <app-whatsapp-button></app-whatsapp-button>
      <app-toast-stack></app-toast-stack>
    </div>
  `,
  styleUrl: './app.component.scss',
  animations: [
    trigger('routeTransition', [
      transition('* <=> *', [
        query(':leave', [animate('220ms ease-out', style({
          opacity: 0,
          transform: 'translateY(18px) scale(0.985) rotateX(6deg)',
        }))], { optional: true }),
        query(':enter', [
          style({
            opacity: 0,
            transform: 'translateY(22px) scale(0.985)',
          }),
          animate('420ms cubic-bezier(.2,.9,.2,1)', style({
            opacity: 1,
            transform: 'translateY(0) scale(1)',
          })),
        ], { optional: true }),
      ]),
    ]),
  ],
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly locale = inject(LocaleService);
  private readonly destroyRef = inject(DestroyRef);

  readonly showBreadcrumb$ = this.router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    map((event) => event.urlAfterRedirects !== '/')
  );

  constructor() {
    this.syncDocumentDirAndLang();
    this.locale.locale$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.syncDocumentDirAndLang());
  }

  private syncDocumentDirAndLang(): void {
    const loc = this.locale.locale;
    const html = this.document.documentElement;
    html.setAttribute('dir', loc === 'ar' ? 'rtl' : 'ltr');
    html.setAttribute('lang', loc);
  }

  getRouteKey(outlet: RouterOutlet): string {
    if (!outlet?.isActivated) {
      return 'initial';
    }
    return outlet.activatedRouteData?.['breadcrumb'] ?? outlet.activatedRoute.routeConfig?.path ?? 'route';
  }
}
