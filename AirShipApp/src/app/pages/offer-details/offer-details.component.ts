import { CommonModule } from '@angular/common';
import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, finalize, of, switchMap } from 'rxjs';
import { Offer } from '../../core/models/app.models';
import { BookingApiService } from '../../core/services/booking-api.service';
import { OffersApiService } from '../../core/services/offers-api.service';
import { ToastService } from '../../core/services/toast.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-offer-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    TranslatePipe,
    LoadingSkeletonComponent,
    EmptyStateComponent,
  ],
  templateUrl: './offer-details.component.html',
  styleUrl: './offer-details.component.scss',
})
export class OfferDetailsComponent {
  loading = true;
  notFound = false;
  submitting = false;
  offer?: Offer;
  selectedImageIndex = 0;

  readonly form = this.fb.group({
    date: ['', Validators.required],
    adults: [2, [Validators.required, Validators.min(1)]],
    children: [0, [Validators.required, Validators.min(0)]],
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly offersApi: OffersApiService,
    private readonly bookingApi: BookingApiService,
    private readonly fb: FormBuilder,
    private readonly destroyRef: DestroyRef,
    private readonly toast: ToastService,
  ) {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('offerId') || '';
          this.loading = true;
          this.notFound = false;
          this.offer = undefined;
          this.selectedImageIndex = 0;
          if (!id.trim()) {
            return of(null).pipe(finalize(() => (this.loading = false)));
          }
          return this.offersApi.getOfferById(id).pipe(
            catchError(() => of(null)),
            finalize(() => (this.loading = false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((row) => {
        if (!row) {
          this.notFound = true;
          return;
        }
        this.offer = {
          ...row,
          highlights: row.highlights ?? [],
          features: row.features ?? [],
          included: row.included ?? [],
          notIncluded: row.notIncluded ?? [],
          terms: row.terms ?? null,
          validUntil: row.validUntil ?? null,
        };
      });
  }

  get selectedImage(): string {
    return this.offer?.images?.[this.selectedImageIndex] ?? this.offer?.images?.[0] ?? '';
  }

  get totalPrice(): number {
    if (!this.offer) {
      return 0;
    }
    const values = this.form.getRawValue();
    const guests = (values.adults ?? 0) + (values.children ?? 0);
    return this.offer.newPrice * Math.max(1, guests);
  }

  selectImage(i: number): void {
    this.selectedImageIndex = i;
  }

  formatValidUntil(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return iso;
    }
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(d);
  }

  submitBooking(): void {
    if (!this.offer) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const values = this.form.getRawValue();
    this.submitting = true;

    this.bookingApi
      .submitBooking({
        fullName: 'Website Guest',
        phone: 'Not Provided',
        citySlug: 'offers',
        relatedSlug: this.offer.id,
        bookingType: 'offer',
        checkIn: values.date ?? '',
        guests: (values.adults ?? 0) + (values.children ?? 0),
        notes: `Adults: ${values.adults ?? 0}, Children: ${values.children ?? 0}, Offer price each: EGP ${this.offer.newPrice.toLocaleString()}, Total: EGP ${this.totalPrice.toLocaleString()}`,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.submitting = false;
          const title = this.offer?.title ?? 'this offer';
          this.toast.success(
            `Offer booking submitted for “${title}”. Confirmation ${result.confirmationId} — we’ll follow up with availability and payment details.`,
          );
        },
        error: () => {
          this.submitting = false;
          this.toast.error('Could not submit your request. Please try again or contact us on WhatsApp.');
        },
      });
  }

  openWhatsApp(): void {
    if (!this.offer) {
      return;
    }
    const values = this.form.getRawValue();
    const lines = [
      'Hello, I want to book this offer:',
      `Offer: ${this.offer.title}`,
      `Date: ${values.date || '-'}`,
      `Adults: ${values.adults ?? 0}`,
      `Children: ${values.children ?? 0}`,
      `Price per guest: EGP ${this.offer.newPrice.toLocaleString()}`,
      `Total: EGP ${this.totalPrice.toLocaleString()}`,
      'Please contact me with availability.',
    ];
    const url = `https://wa.me/201144841607?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
