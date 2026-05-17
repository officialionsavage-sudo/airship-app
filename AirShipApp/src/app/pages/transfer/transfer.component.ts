import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, fromEvent, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SiteSettingsService } from '../../core/services/site-settings.service';
import { ToastService } from '../../core/services/toast.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { resolveSiteContact, type ResolvedSiteContact } from '../../core/site-contact';

type PublicCar = {
  id: string;
  slug: string;
  name: string;
  type: string;
  passengers: number;
  luggage: number;
  pricePerDay: number;
  image: string;
};

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './transfer.component.html',
  styleUrl: './transfer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferComponent implements OnInit {
  activeTab: 'airport' | 'car' = 'airport';
  submitting = false;
  airportErrorKey = '';
  carErrorKey = '';
  readonly isBrowser: boolean;

  readonly airportForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.minLength(7)]],
    email: ['', [Validators.email]],
    country: ['', [Validators.required]],
    adults: [2, [Validators.required, Validators.min(1), Validators.max(12)]],
    child: [0, [Validators.required, Validators.min(0), Validators.max(12)]],
    pickUpPoint: ['', [Validators.required]],
    dropOffPoint: ['', [Validators.required]],
    transferDate: ['', [Validators.required]],
    transferTime: ['', [Validators.required]],
    vehicleType: ['', [Validators.required]],
    transferType: ['oneWay', [Validators.required]],
    comment: [''],
  });

  readonly carRentForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(7)]],
    pickUpLocation: ['', [Validators.required]],
    dropOffLocation: ['', [Validators.required]],
    pickUpDate: ['', [Validators.required]],
    returnDate: ['', [Validators.required]],
    carId: ['', [Validators.required]],
    withDriver: [false],
    comment: [''],
  });

  readonly countries = ['Egypt', 'Saudi Arabia', 'UAE', 'Kuwait', 'Qatar', 'UK', 'Germany', 'Italy', 'France', 'Other'];
  vehicleTypeRows: { id: string; label: string }[] = [];
  readonly transferTypeOptions = [
    { value: 'oneWay', labelKey: 'transfer.types.oneWay' },
    { value: 'roundTrip', labelKey: 'transfer.types.roundTrip' },
  ] as const;

  cars: Array<{
    id: string;
    name: string;
    type: string;
    passengers: number;
    luggage: number;
    pricePerDay: number;
    image: string;
  }> = [];
  carsLoading = true;
  carsError = false;

  contact: ResolvedSiteContact = resolveSiteContact({});

  carPickerOpen = false;
  carPageSize = 4;
  carPage = 1;

  get totalCarPages(): number {
    return Math.max(1, Math.ceil(this.cars.length / this.carPageSize));
  }

  get paginatedCars() {
    const start = (this.carPage - 1) * this.carPageSize;
    return this.cars.slice(start, start + this.carPageSize);
  }

  get selectedCar() {
    const id = this.carRentForm.controls.carId.value;
    return this.cars.find((c) => c.id === id);
  }

  constructor(
    private readonly fb: FormBuilder,
    @Inject(PLATFORM_ID) platformId: object,
    private readonly destroyRef: DestroyRef,
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef,
    private readonly siteSettings: SiteSettingsService,
    private readonly toast: ToastService,
    private readonly i18n: TranslationService,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      fromEvent<KeyboardEvent>(globalThis, 'keydown')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((event) => {
          if (event.key === 'Escape') {
            this.carPickerOpen = false;
            this.cdr.markForCheck();
          }
        });
    }
  }

  ngOnInit(): void {
    const apiBase = environment.apiBaseUrl.replace(/\/$/, '');
    this.http
      .get<Array<{ id: string; label: string }>>(`${apiBase}/api/vehicle-types`)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of([])),
      )
      .subscribe((rows) => {
        this.vehicleTypeRows = rows ?? [];
        this.cdr.markForCheck();
      });

    this.http
      .get<PublicCar[]>(`${apiBase}/api/cars`)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of(null)),
      )
      .subscribe((rows) => {
        this.carsLoading = false;
        if (!rows) {
          this.carsError = true;
          this.cars = [];
        } else {
          this.carsError = false;
          this.cars = rows.map((r) => ({
            id: r.id,
            name: r.name,
            type: r.type,
            passengers: r.passengers,
            luggage: r.luggage,
            pricePerDay: r.pricePerDay,
            image: r.image,
          }));
          this.carPage = 1;
          const sel = this.carRentForm.controls.carId.value;
          if (sel && !this.cars.some((c) => c.id === sel)) {
            this.carRentForm.controls.carId.setValue('');
          }
        }
        this.cdr.markForCheck();
      });

    this.siteSettings
      .getContact()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((contact) => {
        this.contact = contact;
        this.cdr.markForCheck();
      });
  }

  setTab(tab: 'airport' | 'car'): void {
    this.activeTab = tab;
    this.airportErrorKey = '';
    this.carErrorKey = '';
    this.carPickerOpen = false;
    this.cdr.markForCheck();
  }

  toggleCarPicker(): void {
    this.carPickerOpen = !this.carPickerOpen;
    this.cdr.markForCheck();
  }

  closeCarPicker(): void {
    this.carPickerOpen = false;
    this.cdr.markForCheck();
  }

  selectCar(id: string): void {
    this.carRentForm.controls.carId.setValue(id);
    this.carPickerOpen = false;
    this.cdr.markForCheck();
  }

  prevCarPage(): void {
    this.carPage = Math.max(1, this.carPage - 1);
    this.cdr.markForCheck();
  }

  nextCarPage(): void {
    this.carPage = Math.min(this.totalCarPages, this.carPage + 1);
    this.cdr.markForCheck();
  }

  submitAirport(): void {
    this.airportErrorKey = '';
    this.airportForm.markAllAsTouched();
    if (this.airportForm.invalid) {
      this.airportErrorKey = 'transfer.form.formError';
      return;
    }
    this.submitting = true;
    setTimeout(() => {
      this.submitting = false;
      this.toast.success(this.i18n.t('transfer.toastAirportSuccess'));
      this.cdr.markForCheck();
    }, 650);
  }

  submitCarRent(): void {
    this.carErrorKey = '';
    this.carRentForm.markAllAsTouched();
    if (this.carRentForm.invalid) {
      this.carErrorKey = 'transfer.form.formError';
      return;
    }
    this.submitting = true;
    setTimeout(() => {
      this.submitting = false;
      this.toast.success(this.i18n.t('transfer.toastCarSuccess'));
      this.cdr.markForCheck();
    }, 650);
  }
}
