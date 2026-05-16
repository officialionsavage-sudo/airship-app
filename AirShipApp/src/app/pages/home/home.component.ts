import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  Inject,
  inject,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, interval, mergeMap, Observable, of, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AIRSHIP_HOME_CMS_PREVIEW_TYPE } from '../../core/cms-preview.constants';
import { City, PublicReview } from '../../core/models/app.models';
import type { HomePageContent } from '../../core/models/home-page.models';
import { CMS_LOCALES, type CmsLocale } from '../../core/models/home-page.models';
import { mergeHomePageContent } from '../../core/models/home-page.defaults';
import { BackgroundSceneService } from '../../core/services/background-scene.service';
import { CitiesApiService } from '../../core/services/cities-api.service';
import { SiteContentApiService } from '../../core/services/site-content-api.service';
import { ReviewsApiService } from '../../core/services/reviews-api.service';
import { LocaleService } from '../../core/services/locale.service';
import { ToastService } from '../../core/services/toast.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

/** Parent origins allowed to push CMS JSON into `?cmsPreview=1` embeds (AirShip Admin dev servers). */
const CMS_PREVIEW_PARENT_ORIGINS = new Set([
  'http://localhost:4201',
  'http://127.0.0.1:4201',
]);

const CMS_PREVIEW_LOCALE_LABELS: Record<CmsLocale, string> = {
  en: 'English',
  ar: 'العربية',
  de: 'Deutsch',
  ru: 'Русский',
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, TranslatePipe],
  templateUrl: './home.component.html',
  styleUrls: [
    './home.hero-cities.scss',
    './home.about.scss',
    './home.testimonials-reviews.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('citiesStrip') citiesStrip?: ElementRef<HTMLElement>;
  @ViewChild('reviewFormSection') reviewFormSection?: ElementRef<HTMLElement>;

  private readonly fb = inject(FormBuilder);

  readonly cities$: Observable<City[]>;
  reviews: PublicReview[] = [];
  reviewSubmitting = false;
  reviewFormInView = false;
  reviewStarsPulsing = false;
  readonly reviewStars = [1, 2, 3, 4, 5] as const;
  readonly reviewForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    role: [''],
    email: [''],
    rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    text: ['', [Validators.required, Validators.minLength(10)]],
  });
  readonly routeDepth = this.backgroundScene.routeDepth;
  readonly routeMode = this.backgroundScene.sceneMode;
  activeReviewIndex = 0;
  private readonly isBrowser: boolean;
  trackByCity = (_: number, city: City) => city.slug;
  trackByIndex = (index: number) => index;

  homeContent: HomePageContent = mergeHomePageContent(null);
  typedHeroText = '';
  private typingTimeoutId: ReturnType<typeof globalThis.setTimeout> | undefined;
  private typingPhraseIndex = 0;
  private typingCharIndex = 0;
  private typingIsDeleting = false;
  private lastTypingPhraseJson = '';
  readonly cmsPreviewMode: boolean;
  previewLocaleLabel = '';
  previewLocaleFlash = false;
  private previewLocaleFlashTimer: ReturnType<typeof globalThis.setTimeout> | undefined;
  private reviewStarsPulseTimer: ReturnType<typeof globalThis.setTimeout> | undefined;

  private readonly previewMessageListener = (ev: MessageEvent): void => {
    if (!this.cmsPreviewMode) {
      return;
    }
    if (!CMS_PREVIEW_PARENT_ORIGINS.has(ev.origin)) {
      return;
    }
    const data = ev.data as { type?: string; payload?: unknown; locale?: string };
    if (data?.type !== AIRSHIP_HOME_CMS_PREVIEW_TYPE) {
      return;
    }
    if (data.locale && (CMS_LOCALES as readonly string[]).includes(data.locale)) {
      this.applyPreviewLocale(data.locale as CmsLocale);
    }
    if (data.payload == null || typeof data.payload !== 'object') {
      return;
    }
    this.applyPartialHomePayload(data.payload as Partial<HomePageContent>);
  };

  constructor(
    private readonly citiesApi: CitiesApiService,
    private readonly reviewsApi: ReviewsApiService,
    private readonly siteContentApi: SiteContentApiService,
    private readonly localeService: LocaleService,
    private readonly backgroundScene: BackgroundSceneService,
    private readonly toast: ToastService,
    private readonly i18n: TranslationService,
    private readonly cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: object,
    private readonly destroyRef: DestroyRef,
  ) {
    this.cities$ = this.citiesApi.getCities();
    this.isBrowser = isPlatformBrowser(platformId);
    this.cmsPreviewMode =
      this.isBrowser && new URLSearchParams(globalThis.location.search).has('cmsPreview');

    destroyRef.onDestroy(() => {
      if (this.typingTimeoutId != null) {
        globalThis.clearTimeout(this.typingTimeoutId);
      }
      if (this.previewLocaleFlashTimer != null) {
        globalThis.clearTimeout(this.previewLocaleFlashTimer);
      }
      if (this.reviewStarsPulseTimer != null) {
        globalThis.clearTimeout(this.reviewStarsPulseTimer);
      }
    });

    if (this.isBrowser && this.cmsPreviewMode) {
      globalThis.addEventListener('message', this.previewMessageListener);
      destroyRef.onDestroy(() => globalThis.removeEventListener('message', this.previewMessageListener));
    }

    this.lastTypingPhraseJson = JSON.stringify(this.homeContent.hero.typingPhrases);
    this.typedHeroText = this.homeContent.hero.typingPhrases[0] ?? '';

    if (!this.cmsPreviewMode) {
      this.localeService.locale$
        .pipe(
          startWith(this.localeService.locale),
          mergeMap(() => this.siteContentApi.getHome()),
          takeUntilDestroyed(destroyRef),
        )
        .subscribe((partial) => this.applyPartialHomePayload(partial));
    }

    this.reviewsApi
      .getApproved('app')
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((list) => {
        this.reviews = list;
        if (this.activeReviewIndex >= list.length) {
          this.activeReviewIndex = 0;
        }
        this.cdr.markForCheck();
      });

    if (this.isBrowser) {
      interval(4200)
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe(() => {
          const len = this.reviews.length;
          if (len <= 0) {
            return;
          }
          this.activeReviewIndex = (this.activeReviewIndex + 1) % len;
          this.cdr.markForCheck();
        });

      const prefersReducedMotion =
        globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      if (!prefersReducedMotion) {
        this.beginHeroTypingLoop();
      }
    }
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }
    const el = this.reviewFormSection?.nativeElement;
    if (!el) {
      return;
    }
    const prefersReduced =
      globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (prefersReduced) {
      this.reviewFormInView = true;
      this.cdr.markForCheck();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }
        this.reviewFormInView = true;
        this.cdr.markForCheck();
        observer.disconnect();
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    observer.observe(el);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private applyPreviewLocale(locale: CmsLocale): void {
    const label = CMS_PREVIEW_LOCALE_LABELS[locale] ?? locale.toUpperCase();
    const changed = this.previewLocaleLabel !== label;
    this.previewLocaleLabel = label;
    this.localeService.setLocale(locale);
    if (changed) {
      this.previewLocaleFlash = true;
      if (this.previewLocaleFlashTimer != null) {
        globalThis.clearTimeout(this.previewLocaleFlashTimer);
      }
      this.previewLocaleFlashTimer = globalThis.setTimeout(() => {
        this.previewLocaleFlash = false;
        this.previewLocaleFlashTimer = undefined;
        this.cdr.markForCheck();
      }, 1400);
    }
    this.cdr.markForCheck();
  }

  private applyPartialHomePayload(partial: Partial<HomePageContent> | null | undefined): void {
    const merged = mergeHomePageContent(partial ?? undefined);
    const phraseJson = JSON.stringify(merged.hero.typingPhrases);
    const phrasesChanged = phraseJson !== this.lastTypingPhraseJson;
    this.homeContent = merged;
    if (phrasesChanged) {
      this.lastTypingPhraseJson = phraseJson;
      const prefersReducedMotion =
        globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      if (this.isBrowser && !prefersReducedMotion) {
        this.beginHeroTypingLoop();
      } else if (this.isBrowser) {
        this.typedHeroText = this.homeContent.hero.typingPhrases[0] ?? '';
      }
    }
    this.cdr.markForCheck();
  }

  private beginHeroTypingLoop(): void {
    const phrases = this.homeContent.hero.typingPhrases;
    if (phrases.length === 0) {
      this.typedHeroText = '';
      return;
    }
    if (this.typingTimeoutId != null) {
      globalThis.clearTimeout(this.typingTimeoutId);
      this.typingTimeoutId = undefined;
    }
    this.typingPhraseIndex = 0;
    this.typingCharIndex = 0;
    this.typingIsDeleting = false;
    this.typedHeroText = phrases[0] ?? '';
    this.cdr.markForCheck();
    this.typingTimeoutId = globalThis.setTimeout(() => this.heroTypingTick(), 350);
  }

  private heroTypingTick(): void {
    const phrases = this.homeContent.hero.typingPhrases;
    if (phrases.length === 0) {
      return;
    }
    const phrase = phrases[this.typingPhraseIndex % phrases.length];

    if (!this.typingIsDeleting) {
      this.typingCharIndex = Math.min(this.typingCharIndex + 1, phrase.length);
    } else {
      this.typingCharIndex = Math.max(this.typingCharIndex - 1, 0);
    }

    this.typedHeroText = phrase.slice(0, this.typingCharIndex);
    this.cdr.markForCheck();

    const doneTyping = !this.typingIsDeleting && this.typingCharIndex === phrase.length;
    const doneDeleting = this.typingIsDeleting && this.typingCharIndex === 0;

    let nextDelay = this.typingIsDeleting ? 28 : 44;
    if (doneTyping) {
      nextDelay = 900;
      this.typingIsDeleting = true;
    } else if (doneDeleting) {
      nextDelay = 220;
      this.typingIsDeleting = false;
      this.typingPhraseIndex = (this.typingPhraseIndex + 1) % phrases.length;
    }

    this.typingTimeoutId = globalThis.setTimeout(() => this.heroTypingTick(), nextDelay);
  }

  updateCardInteraction(event: MouseEvent): void {
    if (!this.isBrowser || globalThis.matchMedia('(pointer: coarse)').matches) {
      return;
    }
    const card = event.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const ry = (x / rect.width - 0.5) * 10;
    const rx = -((y / rect.height) - 0.5) * 10;
    card.style.setProperty('--mx', `${x}px`);
    card.style.setProperty('--my', `${y}px`);
    card.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
    card.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
  }

  resetCardInteraction(event: MouseEvent): void {
    if (!this.isBrowser) {
      return;
    }
    const card = event.currentTarget as HTMLElement;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  }

  scrollCitiesStrip(direction: -1 | 1): void {
    if (!this.isBrowser) {
      return;
    }
    const el = this.citiesStrip?.nativeElement;
    if (!el) {
      return;
    }
    const step = Math.max(240, Math.round(el.clientWidth * 0.72));
    el.scrollBy({ left: step * direction, behavior: 'smooth' });
  }

  prevReview(): void {
    const len = this.reviews.length;
    if (len <= 1) {
      return;
    }
    this.activeReviewIndex = (this.activeReviewIndex - 1 + len) % len;
    this.cdr.markForCheck();
  }

  nextReview(): void {
    const len = this.reviews.length;
    if (len <= 1) {
      return;
    }
    this.activeReviewIndex = (this.activeReviewIndex + 1) % len;
    this.cdr.markForCheck();
  }

  setReviewRating(stars: number): void {
    this.reviewForm.patchValue({ rating: stars });
    this.reviewForm.get('rating')?.markAsTouched();
    if (this.isBrowser) {
      this.reviewStarsPulsing = true;
      if (this.reviewStarsPulseTimer != null) {
        globalThis.clearTimeout(this.reviewStarsPulseTimer);
      }
      this.reviewStarsPulseTimer = globalThis.setTimeout(() => {
        this.reviewStarsPulsing = false;
        this.reviewStarsPulseTimer = undefined;
        this.cdr.markForCheck();
      }, 520);
    }
    this.cdr.markForCheck();
  }

  submitReview(): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }
    const v = this.reviewForm.getRawValue();
    this.reviewSubmitting = true;
    this.reviewsApi
      .submitReview({
        targetType: 'app',
        name: v.name ?? '',
        text: v.text ?? '',
        rating: v.rating ?? 0,
        role: v.role?.trim() || undefined,
        email: v.email?.trim() || undefined,
      })
      .pipe(
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        this.reviewSubmitting = false;
        if (res?.success) {
          this.toast.success(this.i18n.t('homeReviews.toastThanks'));
          this.reviewForm.reset({ name: '', role: '', email: '', rating: 0, text: '' });
        } else {
          this.toast.error(this.i18n.t('homeReviews.toastError'));
        }
        this.cdr.markForCheck();
      });
  }

  scrollToPrimarySection(event: Event): void {
    event.preventDefault();
    if (!this.isBrowser) {
      return;
    }

    const href = this.homeContent.hero.primaryCta.href.trim();
    if (!href.startsWith('#')) {
      return;
    }

    const id = href.slice(1);
    if (!id) {
      return;
    }

    const section = globalThis.document.getElementById(id);
    if (!section) {
      return;
    }

    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
