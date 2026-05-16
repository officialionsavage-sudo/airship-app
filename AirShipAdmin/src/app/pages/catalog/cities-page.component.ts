import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ADMIN_MSG, adminApiErrorMessage } from '../../core/admin-messages';
import type { AdminPaginated } from '../../core/admin-paginated';
import { apiUrl } from '../../core/api-url';
import { AdminConfirmService } from '../../shared/admin-confirm/admin-confirm.service';
import { AdminNoticeService } from '../../shared/admin-notice/admin-notice.service';
import { AdminImageFieldComponent } from '../../shared/admin-image-field/admin-image-field.component';
import { AdminModalComponent } from '../../shared/admin-modal/admin-modal.component';
import { AdminPaginationBarComponent } from '../../shared/admin-pagination-bar/admin-pagination-bar.component';
import { AdminFieldHintComponent } from '../../shared/admin-field-hint/admin-field-hint.component';
import { CITY_HINTS } from '../../shared/admin-field-hint/admin-field-hints.constants';
import { HelpPanelComponent } from '../../shared/help-panel/help-panel.component';

type CityListRow = {
  id: string;
  slug: string;
  title: string;
  isComingSoon: boolean;
  sortOrder: number;
  _count?: { projects: number; tours: number };
};

type CityRow = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  imageBase64: string;
  heroImageBase64: string;
  portalRealEstateTitle: string;
  portalRealEstateDescription: string;
  portalRealEstateImageBase64: string;
  portalToursTitle: string;
  portalToursDescription: string;
  portalToursImageBase64: string;
  portalTransportTitle: string;
  portalTransportDescription: string;
  portalTransportImageBase64: string;
  isComingSoon: boolean;
  sortOrder: number;
};

@Component({
  selector: 'app-cities-page',
  standalone: true,
  imports: [
    FormsModule,
    NgFor,
    NgIf,
    HelpPanelComponent,
    AdminImageFieldComponent,
    AdminModalComponent,
    AdminPaginationBarComponent,
    AdminFieldHintComponent,
  ],
  template: `
    <h1 class="page-title">Cities</h1>
    <p class="page-intro">
      Destinations appear as cards on the public site. Each city has photos and short text, plus three tiles linking to properties, tours, and transfers.
    </p>
    <app-help-panel title="Before you delete a city">
      Removing a city also removes its linked properties, tours, and offers on the website. Only delete if you are sure.
      Listing dropdown filters are edited separately under <strong>Real estate filters</strong> and <strong>Tour filters</strong>.
    </app-help-panel>
    <div class="admin-toolbar">
      <button type="button" class="btn btn-primary" (click)="openNew()">Add a city</button>
    </div>
    <p *ngIf="listLoaded && rows.length === 0" class="admin-empty-state">
      No cities yet. Click <strong>Add a city</strong> to create the first destination.
    </p>
    <div class="admin-table-wrap-cards" *ngIf="listLoaded && rows.length > 0">
      <div class="admin-scroll">
        <table class="admin-table">
          <thead>
            <tr>
              <th scope="col">Link ending</th>
              <th scope="col">City name</th>
              <th scope="col">Coming soon</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of rows">
              <td><code>{{ row.slug }}</code></td>
              <td>{{ row.title }}</td>
              <td>{{ row.isComingSoon ? 'Yes' : 'No' }}</td>
              <td>
                <button type="button" class="btn" (click)="pick(row)">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="admin-cards">
        <div class="admin-card" *ngFor="let row of rows">
          <strong>{{ row.title }}</strong>
          <div>Link: <code>{{ row.slug }}</code></div>
          <div>Coming soon: {{ row.isComingSoon ? 'Yes' : 'No' }}</div>
          <button type="button" class="btn" (click)="pick(row)">Edit</button>
        </div>
      </div>
    </div>
    <app-admin-pagination-bar
      itemLabel="cities"
      [page]="page"
      [pageSize]="pageSize"
      [total]="total"
      (pageChange)="onPage($event)"
    />

    <app-admin-modal [(open)]="modalOpen" [title]="picked ? 'Edit city' : 'Add a new city'">
      <div class="modal-scroll-form">
        <div class="field">
          <label class="field-label-with-hint" for="c-slug">
            Slug
            <app-admin-field-hint [text]="hint.slug" />
          </label>
          <input id="c-slug" [(ngModel)]="form.slug" />
        </div>
        <div class="field">
          <label class="field-label-with-hint" for="c-title">
            Title
            <app-admin-field-hint [text]="hint.title" />
          </label>
          <input id="c-title" [(ngModel)]="form.title" />
        </div>
        <div class="field">
          <label class="field-label-with-hint" for="c-desc">
            Short description
            <app-admin-field-hint [text]="hint.shortDescription" />
          </label>
          <textarea id="c-desc" [(ngModel)]="form.shortDescription" rows="2"></textarea>
        </div>
        <app-admin-image-field
          [(ngModel)]="form.imageBase64"
          label="Card image"
          [fieldHint]="hint.cardImage"
        />
        <app-admin-image-field
          [(ngModel)]="form.heroImageBase64"
          label="Hero image"
          [fieldHint]="hint.heroImage"
        />

        <h3 class="form-section-title">City landing portals</h3>
        <p class="section-hint">
          <app-admin-field-hint [text]="hint.portalSection" />
        </p>

        <h4 class="form-subtitle">Real estate</h4>
        <div class="field">
          <label class="field-label-with-hint">
            Title
            <app-admin-field-hint [text]="hint.portalRealEstateTitle" />
          </label>
          <input [(ngModel)]="form.portalRealEstateTitle" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Description
            <app-admin-field-hint [text]="hint.portalRealEstateDescription" />
          </label>
          <textarea [(ngModel)]="form.portalRealEstateDescription" rows="2"></textarea>
        </div>
        <app-admin-image-field
          [(ngModel)]="form.portalRealEstateImageBase64"
          label="Portal image (optional)"
          [fieldHint]="hint.portalRealEstateImage"
        />

        <h4 class="form-subtitle">Tours</h4>
        <div class="field">
          <label class="field-label-with-hint">
            Title
            <app-admin-field-hint [text]="hint.portalToursTitle" />
          </label>
          <input [(ngModel)]="form.portalToursTitle" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Description
            <app-admin-field-hint [text]="hint.portalToursDescription" />
          </label>
          <textarea [(ngModel)]="form.portalToursDescription" rows="2"></textarea>
        </div>
        <app-admin-image-field
          [(ngModel)]="form.portalToursImageBase64"
          label="Portal image (optional)"
          [fieldHint]="hint.portalToursImage"
        />

        <h4 class="form-subtitle">Transportation</h4>
        <div class="field">
          <label class="field-label-with-hint">
            Title
            <app-admin-field-hint [text]="hint.portalTransportTitle" />
          </label>
          <input [(ngModel)]="form.portalTransportTitle" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Description
            <app-admin-field-hint [text]="hint.portalTransportDescription" />
          </label>
          <textarea [(ngModel)]="form.portalTransportDescription" rows="2"></textarea>
        </div>
        <app-admin-image-field
          [(ngModel)]="form.portalTransportImageBase64"
          label="Portal image (optional)"
          [fieldHint]="hint.portalTransportImage"
        />

        <div class="field row-inline">
          <label class="field-label-with-hint">
            <input type="checkbox" [(ngModel)]="form.isComingSoon" />
            Coming soon
            <app-admin-field-hint [text]="hint.comingSoon" />
          </label>
        </div>
        <div class="field">
          <label class="field-label-with-hint" for="c-sort">
            Sort order
            <app-admin-field-hint [text]="hint.sortOrder" />
          </label>
          <input id="c-sort" type="number" [(ngModel)]="form.sortOrder" />
        </div>

        <div class="admin-modal-actions">
          <button type="button" class="btn btn-primary" (click)="save()">{{ picked ? 'Save changes' : 'Create city' }}</button>
          <button type="button" class="btn" (click)="closeModal()">Close</button>
          <button type="button" class="btn btn-danger" *ngIf="picked" (click)="remove()">Delete city</button>
        </div>
        <p class="err" *ngIf="error">{{ error }}</p>
      </div>
    </app-admin-modal>
  `,
  styles: [
    `
      .row-inline {
        flex-direction: row !important;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        color: var(--admin-muted);
      }
      .err {
        color: var(--admin-danger);
        margin-top: 0.5rem;
      }
      .form-section-title {
        margin: 1.25rem 0 0.35rem;
        font-size: 1rem;
        font-weight: 700;
      }
      .form-subtitle {
        margin: 0.85rem 0 0.35rem;
        font-size: 0.88rem;
        font-weight: 650;
        color: var(--admin-muted);
      }
      .section-hint {
        margin: 0 0 0.5rem;
      }
      .btn-danger {
        border-color: var(--admin-danger);
        color: var(--admin-danger);
        background: transparent;
      }
    `,
  ],
})
export class CitiesPageComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly confirm = inject(AdminConfirmService);
  private readonly notice = inject(AdminNoticeService);

  readonly hint = CITY_HINTS;

  readonly pageSize = 20;
  page = 1;
  total = 0;
  listLoaded = false;
  rows: CityListRow[] = [];
  picked: CityRow | null = null;
  form = this.emptyForm();
  error = '';
  modalOpen = false;

  ngOnInit(): void {
    this.reload();
  }

  onPage(p: number): void {
    this.page = p;
    this.reload();
  }

  emptyForm(): CityRow {
    return {
      id: '',
      slug: '',
      title: '',
      shortDescription: '',
      imageBase64: '',
      heroImageBase64: '',
      portalRealEstateTitle: '',
      portalRealEstateDescription: '',
      portalRealEstateImageBase64: '',
      portalToursTitle: '',
      portalToursDescription: '',
      portalToursImageBase64: '',
      portalTransportTitle: '',
      portalTransportDescription: '',
      portalTransportImageBase64: '',
      isComingSoon: false,
      sortOrder: 0,
    };
  }

  reload(): void {
    this.http
      .get<AdminPaginated<CityListRow>>(apiUrl('/api/admin/cities'), {
        params: { page: this.page, pageSize: this.pageSize },
      })
      .subscribe({
        next: (r) => {
          this.listLoaded = true;
          this.rows = r.items;
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

  openNew(): void {
    this.picked = null;
    this.form = this.emptyForm();
    this.error = '';
    this.modalOpen = true;
  }

  pick(row: CityListRow): void {
    this.error = '';
    this.http.get<CityRow>(apiUrl(`/api/admin/cities/${row.id}`)).subscribe({
      next: (full) => {
        this.picked = full;
        this.form = { ...full };
        this.modalOpen = true;
      },
      error: () => {
        this.notice.error(ADMIN_MSG.loadList);
      },
    });
  }

  closeModal(): void {
    this.modalOpen = false;
  }

  save(): void {
    void this.saveAsync();
  }

  private async saveAsync(): Promise<void> {
    const ok = await this.confirm.open({
      title: this.picked ? 'Save city?' : 'Create city?',
      message: this.picked
        ? 'Your updates will appear on the live website after saving.'
        : 'A new destination will be added to the catalog.',
      confirmLabel: this.picked ? 'Save changes' : 'Create city',
    });
    if (!ok) {
      return;
    }
    this.error = '';
    const body = {
      slug: this.form.slug.trim(),
      title: this.form.title,
      shortDescription: this.form.shortDescription,
      imageBase64: this.form.imageBase64,
      heroImageBase64: this.form.heroImageBase64,
      portalRealEstateTitle: this.form.portalRealEstateTitle,
      portalRealEstateDescription: this.form.portalRealEstateDescription,
      portalRealEstateImageBase64: this.form.portalRealEstateImageBase64,
      portalToursTitle: this.form.portalToursTitle,
      portalToursDescription: this.form.portalToursDescription,
      portalToursImageBase64: this.form.portalToursImageBase64,
      portalTransportTitle: this.form.portalTransportTitle,
      portalTransportDescription: this.form.portalTransportDescription,
      portalTransportImageBase64: this.form.portalTransportImageBase64,
      isComingSoon: !!this.form.isComingSoon,
      sortOrder: Number(this.form.sortOrder),
    };
    const req = this.picked
      ? this.http.put(apiUrl(`/api/admin/cities/${this.picked.id}`), body)
      : this.http.post(apiUrl('/api/admin/cities'), body);
    req.subscribe({
      next: () => {
        const wasEditing = !!this.picked;
        this.modalOpen = false;
        this.picked = null;
        this.form = this.emptyForm();
        this.notice.success(wasEditing ? 'City saved. Changes are live on the site.' : 'City added.');
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
    if (!this.picked) {
      return;
    }
    const ok = await this.confirm.open({
      title: 'Delete this city?',
      message:
        'This permanently removes the city and everything tied to it (properties, tours, and offers). This cannot be undone.',
      confirmLabel: 'Yes, delete',
    });
    if (!ok) {
      return;
    }
    this.http.delete(apiUrl(`/api/admin/cities/${this.picked.id}`)).subscribe({
      next: () => {
        this.modalOpen = false;
        this.picked = null;
        this.form = this.emptyForm();
        this.notice.success('City deleted.');
        this.reload();
      },
      error: (e) => {
        this.error = adminApiErrorMessage(e, ADMIN_MSG.delete);
      },
    });
  }
}
