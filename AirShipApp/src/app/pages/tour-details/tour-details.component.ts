import { CommonModule } from '@angular/common';
import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, switchMap } from 'rxjs';
import { City, Tour, TourPrice } from '../../core/models/app.models';
import { BookingApiService } from '../../core/services/booking-api.service';
import { CitiesApiService } from '../../core/services/cities-api.service';
import { ToursApiService } from '../../core/services/tours-api.service';
import { ToastService } from '../../core/services/toast.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-tour-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './tour-details.component.html',
  styleUrl: './tour-details.component.scss',
})
export class TourDetailsComponent {
  loading = true;
  submitting = false;
  selectedImageIndex = 0;

  city?: City;
  tour?: Tour;

  readonly form = this.fb.group({
    date: ['', Validators.required],
    adults: [2, [Validators.required, Validators.min(1)]],
    children: [0, [Validators.required, Validators.min(0)]],
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly toursApi: ToursApiService,
    private readonly citiesApi: CitiesApiService,
    private readonly bookingApi: BookingApiService,
    private readonly fb: FormBuilder,
    private readonly destroyRef: DestroyRef,
    private readonly toast: ToastService,
    private readonly i18n: TranslationService,
  ) {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const citySlug = params.get('citySlug') || '';
          const tourSlug = params.get('tourSlug') || '';
          this.loading = true;
          return forkJoin({
            city: this.citiesApi.getCityBySlug(citySlug),
            tour: this.toursApi.getTourBySlug(citySlug, tourSlug),
          });
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ city, tour }) => {
        this.city = city;
        this.tour = tour;
        this.selectedImageIndex = 0;
        this.loading = false;
      });
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  get selectedImage(): string {
    return this.tour?.images[this.selectedImageIndex] ?? this.tour?.images[0] ?? '';
  }

  get anyDiscount(): boolean {
    return (this.tour?.prices ?? []).some((price) => price.discountPercent > 0);
  }

  get adultPrice(): TourPrice | undefined {
    return this.tour?.prices.find((price) => price.label === 'Adult');
  }

  get childPrice(): TourPrice | undefined {
    return this.tour?.prices.find((price) => price.label === 'Child 3-12');
  }

  get infantPrice(): TourPrice | undefined {
    return this.tour?.prices.find((price) => price.label === 'Infant 0-2');
  }

  finalPrice(price?: TourPrice): number {
    if (!price) return 0;
    if (price.discountPercent === 100) return 0;
    return Math.round(price.amount * (1 - price.discountPercent / 100));
  }

  labelForPrice(price?: TourPrice): string {
    if (!price) return 'N/A';
    return price.discountPercent === 100
      ? 'Free'
      : `${this.i18n.t('common.egp')} ${this.finalPrice(price).toLocaleString()}`;
  }

  showDiscountBadge(price?: TourPrice): boolean {
    return !!price && price.discountPercent > 0 && price.discountPercent < 100;
  }

  get totalPrice(): number {
    const values = this.form.getRawValue();
    return (values.adults ?? 0) * this.finalPrice(this.adultPrice) + (values.children ?? 0) * this.finalPrice(this.childPrice);
  }

  submitBooking(): void {
    if (!this.tour || !this.city) {
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
        citySlug: this.city.slug,
        relatedSlug: this.tour.slug,
        bookingType: 'tour',
        checkIn: values.date ?? '',
        guests: (values.adults ?? 0) + (values.children ?? 0),
        notes: `Adults: ${values.adults ?? 0}, Children: ${values.children ?? 0}, Total: EGP ${this.totalPrice.toLocaleString()}`,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.submitting = false;
        const title = this.tour?.title ?? 'this tour';
        this.toast.success(
          `Tour booking submitted for “${title}”. Confirmation ${result.confirmationId} — we’ll follow up with availability and payment details.`,
        );
      });
  }

  openWhatsApp(): void {
    if (!this.tour || !this.city) {
      return;
    }
    const values = this.form.getRawValue();
    const lines = [
      'Hello, I want to book this tour:',
      `Tour: ${this.tour.title}`,
      `City: ${this.city.title}`,
      `Date: ${values.date || '-'}`,
      `Adults: ${values.adults ?? 0}`,
      `Children: ${values.children ?? 0}`,
      `Total price: EGP ${this.totalPrice.toLocaleString()}`,
      'Please contact me with availability.',
    ];

    const url = `https://wa.me/201144841607?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
