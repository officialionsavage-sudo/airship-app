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
import { AdminFieldHintComponent } from '../../shared/admin-field-hint/admin-field-hint.component';
import { AdminStringListComponent } from '../../shared/admin-string-list/admin-string-list.component';
import { OFFER_HINTS } from '../../shared/admin-field-hint/admin-field-hints.constants';
import { HelpPanelComponent } from '../../shared/help-panel/help-panel.component';

type OfferListRow = {
  id: string;
  title: string;
  oldPrice: number;
  newPrice: number;
  discountPercent: number;
  sortOrder: number;
  updatedAt?: string;
  imageCount: number;
};

type OfferFull = {
  id: string;
  title: string;
  description: string;
  images: string[];
  oldPrice: number;
  newPrice: number;
  discountPercent: number;
  sortOrder: number;
  highlights: string[];
  features: string[];
  included: string[];
  notIncluded: string[];
  terms: string | null;
  validUntil: string | null;
};

@Component({
  selector: 'app-offers-page',
  standalone: true,
  imports: [
    FormsModule,
    NgFor,
    NgIf,
    HelpPanelComponent,
    AdminImageJsonArrayComponent,
    AdminModalComponent,
    AdminPaginationBarComponent,
    AdminFieldHintComponent,
    AdminStringListComponent,
  ],
  template: `
    <h1 class="page-title">Offers</h1>
    <p class="page-intro">
      Standalone promotional tiles: title, description, gallery, prices, and detail sections (highlights, features, included).
    </p>
    <app-help-panel title="Detail page">
      Highlights appear as chips; features and included/not-included lists mirror tour and unit detail pages. Booking inquiries use type
      <code>offer</code> on the public site.
    </app-help-panel>
    <div class="admin-toolbar">
      <button type="button" class="btn btn-primary" (click)="openNew()">Add offer</button>
    </div>
    <p *ngIf="listLoaded && offers.length === 0" class="admin-empty-state">No offers yet.</p>
    <div class="admin-table-wrap-cards" *ngIf="listLoaded && offers.length > 0">
      <div class="admin-scroll">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Images</th>
              <th>Prices</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let o of offers">
              <td>{{ o.title }}</td>
              <td>{{ o.imageCount }}</td>
              <td>{{ o.newPrice }} / {{ o.oldPrice }} ({{ o.discountPercent }}%)</td>
              <td><button type="button" class="btn" (click)="pick(o)">Edit</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <app-admin-pagination-bar
      itemLabel="offers"
      [page]="page"
      [pageSize]="pageSize"
      [total]="total"
      (pageChange)="onPage($event)"
    />

    <app-admin-modal [(open)]="modalOpen" [title]="picked ? 'Edit offer' : 'Add offer'" [wide]="true">
      <div class="modal-scroll-form">
        <div class="field">
          <label class="field-label-with-hint">
            Title
            <app-admin-field-hint [text]="hint.title" />
          </label>
          <input [(ngModel)]="f.title" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Description
            <app-admin-field-hint [text]="hint.description" />
          </label>
          <textarea rows="4" [(ngModel)]="f.description"></textarea>
        </div>
        <app-admin-string-list [(ngModel)]="f.highlights" label="Highlights" [fieldHint]="hint.highlights" />
        <app-admin-string-list [(ngModel)]="f.features" label="Features" [fieldHint]="hint.features" />
        <app-admin-string-list [(ngModel)]="f.included" label="Included" [fieldHint]="hint.included" />
        <app-admin-string-list [(ngModel)]="f.notIncluded" label="Not included" [fieldHint]="hint.notIncluded" />
        <div class="field">
          <label class="field-label-with-hint">
            Valid until
            <app-admin-field-hint [text]="hint.validUntil" />
          </label>
          <input type="date" [(ngModel)]="f.validUntil" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Terms
            <app-admin-field-hint [text]="hint.terms" />
          </label>
          <textarea rows="3" [(ngModel)]="f.terms"></textarea>
        </div>
        <div class="field-row">
          <div class="field">
            <label class="field-label-with-hint">
              Old price
              <app-admin-field-hint [text]="hint.oldPrice" />
            </label>
            <input type="number" [(ngModel)]="f.oldPrice" />
          </div>
          <div class="field">
            <label class="field-label-with-hint">
              New price
              <app-admin-field-hint [text]="hint.newPrice" />
            </label>
            <input type="number" [(ngModel)]="f.newPrice" />
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label class="field-label-with-hint">
              Discount %
              <app-admin-field-hint [text]="hint.discountPercent" />
            </label>
            <input type="number" [(ngModel)]="f.discountPercent" />
          </div>
          <div class="field">
            <label class="field-label-with-hint">
              Sort order
              <app-admin-field-hint [text]="hint.sortOrder" />
            </label>
            <input type="number" [(ngModel)]="f.sortOrder" />
          </div>
        </div>
        <app-admin-image-json-array
          [(ngModel)]="f.imagesJson"
          label="Offer images"
          [fieldHint]="hint.images"
          [maxCount]="10"
        />
        <p class="err" *ngIf="error">{{ error }}</p>
        <div class="admin-modal-actions">
          <button type="button" class="btn btn-primary" (click)="save()">{{ picked ? 'Save' : 'Create' }}</button>
          <button type="button" class="btn" (click)="modalOpen = false">Close</button>
          <button type="button" class="btn btn-danger" *ngIf="picked" (click)="remove()">Delete</button>
        </div>
      </div>
    </app-admin-modal>
  `,
  styles: [
    `
      .field-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }
      @media (max-width: 560px) {
        .field-row {
          grid-template-columns: 1fr;
        }
      }
      .err {
        color: var(--admin-danger);
        margin-top: 0.5rem;
      }
    `,
  ],
})
export class OffersPageComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly confirm = inject(AdminConfirmService);
  private readonly notice = inject(AdminNoticeService);

  readonly hint = OFFER_HINTS;
  readonly pageSize = 20;
  page = 1;
  total = 0;
  listLoaded = false;
  offers: OfferListRow[] = [];
  picked: OfferFull | null = null;
  f = this.empty();
  error = '';
  modalOpen = false;

  ngOnInit(): void {
    this.reload();
  }

  onPage(p: number): void {
    this.page = p;
    this.reload();
  }

  empty() {
    return {
      title: '',
      description: '',
      oldPrice: 0,
      newPrice: 0,
      discountPercent: 0,
      sortOrder: 0,
      imagesJson: '[]',
      highlights: [] as string[],
      features: [] as string[],
      included: [] as string[],
      notIncluded: [] as string[],
      terms: '',
      validUntil: '',
    };
  }

  reload(): void {
    this.http
      .get<AdminPaginated<OfferListRow>>(apiUrl('/api/admin/offers'), {
        params: { page: this.page, pageSize: this.pageSize },
      })
      .subscribe({
        next: (r) => {
          this.listLoaded = true;
          this.offers = r.items;
          this.total = r.total;
        },
        error: () => {
          this.listLoaded = true;
          this.notice.error(ADMIN_MSG.loadList);
        },
      });
  }

  openNew(): void {
    this.picked = null;
    this.f = this.empty();
    this.error = '';
    this.modalOpen = true;
  }

  pick(o: OfferListRow): void {
    this.error = '';
    this.http.get<OfferFull>(apiUrl(`/api/admin/offers/${o.id}`)).subscribe({
      next: (full) => {
        this.picked = full;
        this.f = {
          title: full.title,
          description: full.description,
          oldPrice: full.oldPrice,
          newPrice: full.newPrice,
          discountPercent: full.discountPercent,
          sortOrder: full.sortOrder,
          imagesJson: JSON.stringify(full.images ?? [], null, 2),
          highlights: Array.isArray(full.highlights) ? [...full.highlights] : [],
          features: Array.isArray(full.features) ? [...full.features] : [],
          included: Array.isArray(full.included) ? [...full.included] : [],
          notIncluded: Array.isArray(full.notIncluded) ? [...full.notIncluded] : [],
          terms: full.terms ?? '',
          validUntil: full.validUntil ? String(full.validUntil).slice(0, 10) : '',
        };
        this.modalOpen = true;
      },
      error: (e) => {
        this.notice.error(adminApiErrorMessage(e, ADMIN_MSG.loadList));
      },
    });
  }

  save(): void {
    void this.saveAsync();
  }

  private async saveAsync(): Promise<void> {
    let images: string[] = [];
    try {
      const parsed = JSON.parse(this.f.imagesJson || '[]');
      images = Array.isArray(parsed) ? parsed.map((x: unknown) => String(x)) : [];
    } catch {
      this.error = 'Images must be valid JSON array.';
      return;
    }
    if (!this.f.title.trim()) {
      this.error = 'Title is required.';
      return;
    }
    if (images.length === 0 || !images.some((x) => x.trim())) {
      this.error = 'Add at least one image.';
      return;
    }
    if (images.length > 10) {
      this.error = ADMIN_MSG.galleryMax;
      return;
    }
    const ok = await this.confirm.open({
      title: this.picked ? 'Save offer?' : 'Create offer?',
      message: 'Changes go live on the public offers page after saving.',
      confirmLabel: this.picked ? 'Save' : 'Create',
    });
    if (!ok) return;

    const trimLines = (xs: string[]) => xs.map((s) => s.trim()).filter(Boolean);
    const body = {
      title: this.f.title.trim(),
      description: this.f.description,
      images,
      oldPrice: Number(this.f.oldPrice),
      newPrice: Number(this.f.newPrice),
      discountPercent: Number(this.f.discountPercent),
      sortOrder: Number(this.f.sortOrder),
      highlights: trimLines(this.f.highlights),
      features: trimLines(this.f.features),
      included: trimLines(this.f.included),
      notIncluded: trimLines(this.f.notIncluded),
      terms: this.f.terms.trim() === '' ? null : this.f.terms.trim(),
      validUntil: this.f.validUntil.trim() === '' ? null : this.f.validUntil.trim(),
    };
    this.error = '';
    const req = this.picked
      ? this.http.put(apiUrl(`/api/admin/offers/${this.picked.id}`), body)
      : this.http.post(apiUrl('/api/admin/offers'), body);
    req.subscribe({
      next: () => {
        this.modalOpen = false;
        this.picked = null;
        this.f = this.empty();
        this.notice.success('Saved.');
        this.reload();
      },
      error: (e) => {
        this.error = adminApiErrorMessage(e, ADMIN_MSG.save);
      },
    });
  }

  remove(): void {
    void this.removeAsync();
  }

  private async removeAsync(): Promise<void> {
    if (!this.picked) return;
    const ok = await this.confirm.open({
      title: 'Delete offer?',
      message: 'Removes this tile from the public site.',
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    this.http.delete(apiUrl(`/api/admin/offers/${this.picked.id}`)).subscribe({
      next: () => {
        this.modalOpen = false;
        this.picked = null;
        this.f = this.empty();
        this.notice.success('Removed.');
        this.reload();
      },
      error: (e) => {
        this.error = adminApiErrorMessage(e, ADMIN_MSG.delete);
      },
    });
  }
}
