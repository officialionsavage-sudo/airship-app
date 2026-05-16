import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ADMIN_MSG, adminApiErrorMessage } from '../../core/admin-messages';
import type { AdminPaginated } from '../../core/admin-paginated';
import { apiUrl } from '../../core/api-url';
import { AdminConfirmService } from '../../shared/admin-confirm/admin-confirm.service';
import { AdminNoticeService } from '../../shared/admin-notice/admin-notice.service';
import { AdminImageJsonArrayComponent } from '../../shared/admin-image-json-array/admin-image-json-array.component';
import { AdminModalComponent } from '../../shared/admin-modal/admin-modal.component';
import { AdminPaginationBarComponent } from '../../shared/admin-pagination-bar/admin-pagination-bar.component';
import { AdminStringListComponent } from '../../shared/admin-string-list/admin-string-list.component';
import type { TourPriceRow } from '../../shared/admin-tour-prices/admin-tour-prices.component';
import { AdminTourPricesComponent } from '../../shared/admin-tour-prices/admin-tour-prices.component';
import { AdminFieldHintComponent } from '../../shared/admin-field-hint/admin-field-hint.component';
import { TOUR_HINTS } from '../../shared/admin-field-hint/admin-field-hints.constants';
import { HelpPanelComponent } from '../../shared/help-panel/help-panel.component';

type TourList = {
  id: string;
  slug: string;
  title: string;
  city: { slug: string; id?: string };
  type: string;
};

@Component({
  selector: 'app-tours-page',
  standalone: true,
  imports: [
    FormsModule,
    NgFor,
    NgIf,
    HelpPanelComponent,
    AdminImageJsonArrayComponent,
    AdminModalComponent,
    AdminPaginationBarComponent,
    AdminStringListComponent,
    AdminTourPricesComponent,
    AdminFieldHintComponent,
  ],
  template: `
    <h1 class="page-title">Tours</h1>
    <p class="page-intro">
      Experiences (boat trips, desert safaris, etc.) shown on each destination’s tours page. Prices and photos are edited here; the category dropdown on the public site uses <strong>Tour filters</strong> plus the checkboxes below when you edit a tour.
    </p>
    <app-help-panel title="How this screen works">
      Use simple lists for itinerary and what’s included — no technical formatting needed. When you click edit, all ticket prices load automatically with the tour.
    </app-help-panel>
    <div class="admin-toolbar">
      <button type="button" class="btn btn-primary" (click)="startNew()">Add a tour</button>
    </div>
    <p *ngIf="listLoaded && tours.length === 0" class="admin-empty-state">
      No tours yet. Click <strong>Add a tour</strong> to create one for a city you already added under Cities.
    </p>
    <div class="admin-table-wrap-cards" *ngIf="listLoaded && tours.length > 0">
      <div class="admin-scroll">
        <table class="admin-table">
          <thead>
            <tr>
              <th scope="col">Link ending</th>
              <th scope="col">Tour name</th>
              <th scope="col">City</th>
              <th scope="col">Category</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of tours">
              <td><code>{{ t.slug }}</code></td>
              <td>{{ t.title }}</td>
              <td>{{ t.city.slug }}</td>
              <td>{{ prettyTourType(t.type) }}</td>
              <td><button type="button" class="btn" (click)="load(t.id)">Edit</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="admin-cards">
        <div class="admin-card" *ngFor="let t of tours">
          <strong>{{ t.title }}</strong>
          <div>Link: <code>{{ t.slug }}</code> · {{ t.city.slug }} · {{ prettyTourType(t.type) }}</div>
          <button type="button" class="btn" (click)="load(t.id)">Edit</button>
        </div>
      </div>
    </div>
    <app-admin-pagination-bar
      itemLabel="tours"
      [page]="page"
      [pageSize]="pageSize"
      [total]="total"
      (pageChange)="onPage($event)"
    />

    <app-admin-modal [(open)]="modalOpen" [title]="isNew ? 'Add a new tour' : 'Edit tour'" [wide]="true">
      <div class="modal-scroll-form">
        <div class="field">
          <label class="field-label-with-hint">
            Tour link ending
            <app-admin-field-hint [text]="hint.slug" />
          </label>
          <input [(ngModel)]="f.slug" placeholder="e.g. sunset-cruise" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            City (link ending)
            <app-admin-field-hint [text]="hint.citySlug" />
          </label>
          <input [(ngModel)]="f.citySlug" (ngModelChange)="onTourCitySlugChange()" placeholder="Must match an existing city" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Title
            <app-admin-field-hint [text]="hint.title" />
          </label>
          <input [(ngModel)]="f.title" />
        </div>
        <div class="field" *ngIf="tourFilterOptions.length">
          <span class="field-label-with-hint">
            Tour listing filters
            <app-admin-field-hint text="Buckets for the city’s tour page. Define them under Catalog → Tour filters; tick the ones this tour should appear under." />
          </span>
          <div class="tour-filter-chk-grid">
            <label class="tour-filter-chk" *ngFor="let opt of tourFilterOptions">
              <input type="checkbox" [checked]="tourFilterChecked(opt.id)" (change)="toggleTourFilter(opt.id, $event)" />
              <span>{{ opt.title }} <code>{{ opt.slug }}</code></span>
            </label>
          </div>
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Tour type
            <app-admin-field-hint [text]="hint.type" />
          </label>
          <select [(ngModel)]="f.type">
            <option value="sea">Sea</option>
            <option value="desert">Desert</option>
            <option value="island">Island</option>
            <option value="city">City</option>
            <option value="adventure">Adventure</option>
            <option value="wellness">Wellness</option>
          </select>
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Rating
            <app-admin-field-hint [text]="hint.rating" />
          </label>
          <input type="number" step="0.1" [(ngModel)]="f.rating" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Start price
            <app-admin-field-hint [text]="hint.startPrice" />
          </label>
          <input type="number" [(ngModel)]="f.startPrice" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Duration
            <app-admin-field-hint [text]="hint.duration" />
          </label>
          <input [(ngModel)]="f.duration" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Departure
            <app-admin-field-hint [text]="hint.departureTime" />
          </label>
          <input [(ngModel)]="f.departureTime" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Group size
            <app-admin-field-hint [text]="hint.groupSize" />
          </label>
          <input [(ngModel)]="f.groupSize" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Overview
            <app-admin-field-hint [text]="hint.overview" />
          </label>
          <textarea [(ngModel)]="f.overview" rows="3"></textarea>
        </div>
        <app-admin-image-json-array
          [(ngModel)]="f.imagesJson"
          label="Tour gallery images"
          [fieldHint]="hint.gallery"
        />
        <app-admin-string-list
          [(ngModel)]="f.itinerary"
          label="Itinerary (one step per line)"
          [fieldHint]="hint.itinerary"
        />
        <app-admin-string-list [(ngModel)]="f.included" label="Included" [fieldHint]="hint.included" />
        <app-admin-string-list
          [(ngModel)]="f.notIncluded"
          label="Not included"
          [fieldHint]="hint.notIncluded"
        />
        <app-admin-tour-prices [(ngModel)]="f.prices" [fieldHint]="hint.prices" />
        <p class="err" *ngIf="error">{{ error }}</p>
        <div class="admin-modal-actions">
          <button type="button" class="btn btn-primary" (click)="save()">
            <span *ngIf="isNew">Create tour</span>
            <span *ngIf="!isNew">Save changes</span>
          </button>
          <button type="button" class="btn" (click)="closeModal()">Close</button>
        </div>
      </div>
    </app-admin-modal>
  `,
  styles: [
    `
      .tour-filter-chk-grid {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        margin-top: 0.35rem;
      }
      .tour-filter-chk {
        display: flex;
        align-items: flex-start;
        gap: 0.4rem;
        font-size: 0.84rem;
      }
      .tour-filter-chk code {
        font-size: 0.78em;
      }
    `,
  ],
})
export class ToursPageComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly confirm = inject(AdminConfirmService);
  private readonly notice = inject(AdminNoticeService);

  readonly hint = TOUR_HINTS;
  readonly pageSize = 20;
  page = 1;
  total = 0;

  tours: TourList[] = [];
  listLoaded = false;
  pickedId: string | null = null;
  isNew = false;
  modalOpen = false;
  f = this.empty();
  error = '';

  /** Resolve city slug → id for loading tour catalog filters in the modal. */
  private cityOpts: { id: string; slug: string }[] = [];
  tourFilterOptions: { id: string; title: string; slug: string }[] = [];

  ngOnInit(): void {
    this.reload();
    this.loadCityOpts();
  }

  prettyTourType(t: string): string {
    const labels: Record<string, string> = {
      sea: 'Sea',
      desert: 'Desert',
      island: 'Island',
      city: 'City',
      adventure: 'Adventure',
      wellness: 'Wellness',
    };
    return labels[t] ?? t;
  }

  onPage(p: number): void {
    this.page = p;
    this.reload();
  }

  startNew(): void {
    this.isNew = true;
    this.pickedId = null;
    this.f = this.empty();
    this.tourFilterOptions = [];
    this.error = '';
    this.modalOpen = true;
  }

  empty() {
    return {
      slug: '',
      citySlug: '',
      title: '',
      type: 'sea' as 'sea' | 'desert' | 'island' | 'city' | 'adventure' | 'wellness',
      rating: 5,
      startPrice: 0,
      duration: '',
      departureTime: '',
      groupSize: '',
      overview: '',
      imagesJson: '[]',
      itinerary: [] as string[],
      included: [] as string[],
      notIncluded: [] as string[],
      prices: [] as TourPriceRow[],
      catalogFilterIds: [] as string[],
    };
  }

  reload(): void {
    this.http
      .get<AdminPaginated<TourList>>(apiUrl('/api/admin/tours'), {
        params: { page: this.page, pageSize: this.pageSize },
      })
      .subscribe({
        next: (r) => {
          this.listLoaded = true;
          this.tours = r.items;
          this.total = r.total;
          if (r.items.length === 0 && r.total > 0 && this.page > 1) {
            this.page--;
            this.reload();
          }
        },
        error: () => {
          this.listLoaded = true;
          this.notice.error(ADMIN_MSG.loadList);
        },
      });
  }

  private loadCityOpts(): void {
    this.http
      .get<AdminPaginated<{ id: string; slug: string }>>(apiUrl('/api/admin/cities'), {
        params: { page: 1, pageSize: 500 },
      })
      .subscribe({
        next: (r) => {
          this.cityOpts = r.items.map((c) => ({ id: c.id, slug: c.slug }));
        },
        error: () => {
          this.cityOpts = [];
        },
      });
  }

  onTourCitySlugChange(): void {
    const slug = this.f.citySlug.trim();
    const row = this.cityOpts.find((c) => c.slug === slug);
    this.f.catalogFilterIds = [];
    this.refreshTourFilters(row?.id ?? null);
  }

  private refreshTourFilters(cityId: string | null): void {
    this.tourFilterOptions = [];
    if (!cityId) {
      return;
    }
    this.http
      .get<AdminPaginated<{ id: string; title: string; slug: string }>>(
        apiUrl(`/api/admin/cities/${cityId}/catalog-filters`),
        { params: { domain: 'TOURS', page: '1', pageSize: '200' } },
      )
      .subscribe({
        next: (r) => {
          this.tourFilterOptions = r.items;
        },
        error: () => {
          this.tourFilterOptions = [];
        },
      });
  }

  tourFilterChecked(id: string): boolean {
    return this.f.catalogFilterIds.includes(id);
  }

  toggleTourFilter(id: string, ev: Event): void {
    const input = ev.target as HTMLInputElement | null;
    const checked = !!input?.checked;
    if (checked) {
      if (!this.f.catalogFilterIds.includes(id)) {
        this.f.catalogFilterIds = [...this.f.catalogFilterIds, id];
      }
    } else {
      this.f.catalogFilterIds = this.f.catalogFilterIds.filter((x) => x !== id);
    }
  }

  load(id: string): void {
    this.error = '';
    this.isNew = false;
    this.http.get<any>(apiUrl(`/api/admin/tours/${id}`)).subscribe({
      next: (t) => {
        this.pickedId = id;
        this.f = {
          slug: t.slug,
          citySlug: t.city?.slug ?? '',
          title: t.title,
          type: t.type,
          rating: t.rating,
          startPrice: t.startPrice,
          duration: t.duration,
          departureTime: t.departureTime,
          groupSize: t.groupSize,
          overview: t.overview,
          imagesJson: JSON.stringify(t.images ?? [], null, 2),
          itinerary: Array.isArray(t.itinerary) ? [...t.itinerary.map((x: unknown) => String(x))] : [],
          included: Array.isArray(t.included) ? [...t.included.map((x: unknown) => String(x))] : [],
          notIncluded: Array.isArray(t.notIncluded) ? [...t.notIncluded.map((x: unknown) => String(x))] : [],
          prices: Array.isArray(t.prices)
            ? t.prices.map((p: any) => ({
                label: String(p.label ?? ''),
                amount: Number(p.amount) || 0,
                discountPercent: Number(p.discountPercent) || 0,
              }))
            : [],
          catalogFilterIds: Array.isArray(t.catalogFilterIds) ? [...t.catalogFilterIds.map(String)] : [],
        };
        this.refreshTourFilters(t.city?.id ?? null);
        this.modalOpen = true;
      },
      error: (e) => {
        this.notice.error(adminApiErrorMessage(e, ADMIN_MSG.loadDetail));
      },
    });
  }

  closeModal(): void {
    this.modalOpen = false;
    this.isNew = false;
    this.pickedId = null;
    this.f = this.empty();
    this.tourFilterOptions = [];
  }

  save(): void {
    void this.saveAsync();
  }

  private parseImages(): string[] | null {
    try {
      const v = JSON.parse(this.f.imagesJson);
      return Array.isArray(v) ? v.map((x: unknown) => String(x)) : null;
    } catch {
      this.error = ADMIN_MSG.galleryJson;
      return null;
    }
  }

  private async saveAsync(): Promise<void> {
    if (!this.isNew && !this.pickedId) {
      return;
    }
    const ok = await this.confirm.open({
      title: this.isNew ? 'Create tour?' : 'Save tour?',
      message: this.isNew
        ? 'The tour will appear under the selected city on the live site.'
        : 'Visitors will see your updates after saving.',
      confirmLabel: this.isNew ? 'Create tour' : 'Save changes',
    });
    if (!ok) {
      return;
    }
    const images = this.parseImages();
    if (!images) {
      return;
    }
    const trimLines = (xs: string[]) => xs.map((s) => s.trim()).filter(Boolean);
    const prices = this.f.prices.filter((p) => p.label.trim() !== '');
    if (prices.some((p) => !Number.isFinite(p.amount) || p.amount < 0)) {
      this.error = ADMIN_MSG.pricesInvalid;
      return;
    }
    const body = {
      slug: this.f.slug.trim(),
      citySlug: this.f.citySlug.trim(),
      title: this.f.title,
      type: this.f.type,
      rating: Number(this.f.rating),
      startPrice: Number(this.f.startPrice),
      duration: this.f.duration,
      departureTime: this.f.departureTime,
      groupSize: this.f.groupSize,
      overview: this.f.overview,
      images,
      itinerary: trimLines(this.f.itinerary),
      included: trimLines(this.f.included),
      notIncluded: trimLines(this.f.notIncluded),
      prices: prices.map((p) => ({
        label: p.label.trim(),
        amount: Math.round(Number(p.amount)),
        discountPercent: Math.round(Number(p.discountPercent)),
      })),
      catalogFilterIds: this.f.catalogFilterIds,
    };
    this.error = '';
    const req =
      this.isNew || !this.pickedId
        ? this.http.post(apiUrl('/api/admin/tours'), body)
        : this.http.put(apiUrl(`/api/admin/tours/${this.pickedId}`), body);
    req.subscribe({
      next: () => {
        const wasNew = this.isNew;
        this.closeModal();
        this.notice.success(wasNew ? 'Tour created.' : 'Tour saved.');
        this.reload();
      },
      error: (e) => {
        this.error = adminApiErrorMessage(e, ADMIN_MSG.save);
      },
    });
  }
}
