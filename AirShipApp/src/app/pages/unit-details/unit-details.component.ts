import { CommonModule } from '@angular/common';
import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, switchMap } from 'rxjs';
import { City, Project, Unit } from '../../core/models/app.models';
import { BookingApiService } from '../../core/services/booking-api.service';
import { CitiesApiService } from '../../core/services/cities-api.service';
import { ProjectsApiService } from '../../core/services/projects-api.service';
import { UnitsApiService } from '../../core/services/units-api.service';
import { ToastService } from '../../core/services/toast.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-unit-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './unit-details.component.html',
  styleUrl: './unit-details.component.scss',
})
export class UnitDetailsComponent {
  loading = true;
  submitting = false;
  selectedImageIndex = 0;

  city?: City;
  project?: Project;
  unit?: Unit;

  readonly form = this.fb.group({
    checkIn: ['', Validators.required],
    checkOut: ['', Validators.required],
    adults: [2, [Validators.required, Validators.min(1)]],
    children: [0, [Validators.required, Validators.min(0)]],
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly unitsApi: UnitsApiService,
    private readonly projectsApi: ProjectsApiService,
    private readonly citiesApi: CitiesApiService,
    private readonly bookingApi: BookingApiService,
    private readonly fb: FormBuilder,
    private readonly destroyRef: DestroyRef,
    private readonly toast: ToastService,
  ) {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const citySlug = params.get('citySlug') || '';
          const projectSlug = params.get('projectSlug') || '';
          const unitSlug = params.get('unitSlug') || '';
          this.loading = true;
          return forkJoin({
            city: this.citiesApi.getCityBySlug(citySlug),
            project: this.projectsApi.getProjectBySlug(citySlug, projectSlug),
            unit: this.unitsApi.getUnitBySlug(projectSlug, unitSlug),
          });
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ city, project, unit }) => {
        this.city = city;
        this.project = project;
        this.unit = unit;
        this.selectedImageIndex = 0;
        this.loading = false;
      });
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  get selectedImage(): string {
    if (!this.unit) {
      return '';
    }
    return this.unit.images[this.selectedImageIndex] ?? this.unit.images[0];
  }

  get discountedDay(): number {
    return this.calculateDiscounted(this.unit?.pricePerDay ?? 0, this.unit?.discounts.day ?? 0);
  }

  get discountedWeek(): number {
    return this.calculateDiscounted(this.unit?.pricePerWeek ?? 0, this.unit?.discounts.week ?? 0);
  }

  get discountedMonth(): number {
    return this.calculateDiscounted(this.unit?.pricePerMonth ?? 0, this.unit?.discounts.month ?? 0);
  }

  private calculateDiscounted(price: number, discount: number): number {
    if (!discount) {
      return price;
    }
    return Math.round(price * (1 - discount / 100));
  }

  submitBooking(): void {
    if (!this.unit || !this.project || !this.city) {
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
        relatedSlug: this.unit.slug,
        bookingType: 'property',
        checkIn: values.checkIn ?? '',
        checkOut: values.checkOut ?? '',
        guests: (values.adults ?? 0) + (values.children ?? 0),
        notes: `Adults: ${values.adults ?? 0}, Children: ${values.children ?? 0}`,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.submitting = false;
        const title = this.unit?.title ?? 'this unit';
        this.toast.success(
          `Stay request submitted for “${title}”. Confirmation ${result.confirmationId} — we’ll confirm dates and next steps shortly.`,
        );
      });
  }

  openWhatsApp(): void {
    if (!this.unit || !this.project || !this.city) {
      return;
    }
    const values = this.form.getRawValue();
    const lines = [
      'Hello, I want to book this stay:',
      `Unit: ${this.unit.title}`,
      `Project: ${this.project.title}`,
      `City: ${this.city.title}`,
      `Check-in: ${values.checkIn || '-'}`,
      `Check-out: ${values.checkOut || '-'}`,
      `Adults: ${values.adults ?? 0}`,
      `Children: ${values.children ?? 0}`,
      'Selected prices:',
      `Day: EGP ${this.discountedDay.toLocaleString()}`,
      `Week: EGP ${this.discountedWeek.toLocaleString()}`,
      `Month: EGP ${this.discountedMonth.toLocaleString()}`,
      'Please contact me with availability.',
    ];
    const url = `https://wa.me/201144841607?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
