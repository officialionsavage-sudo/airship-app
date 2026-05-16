import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ADMIN_MSG, adminApiErrorMessage } from '../../core/admin-messages';
import type { AdminPaginated } from '../../core/admin-paginated';
import { apiUrl } from '../../core/api-url';
import { AdminConfirmService } from '../../shared/admin-confirm/admin-confirm.service';
import { AdminNoticeService } from '../../shared/admin-notice/admin-notice.service';
import { AdminModalComponent } from '../../shared/admin-modal/admin-modal.component';
import { AdminPaginationBarComponent } from '../../shared/admin-pagination-bar/admin-pagination-bar.component';
import { AdminFieldHintComponent } from '../../shared/admin-field-hint/admin-field-hint.component';
import { LISTING_FILTERS_HINTS } from '../../shared/admin-field-hint/admin-field-hints.constants';
import { HelpPanelComponent } from '../../shared/help-panel/help-panel.component';

type CityOpt = { id: string; slug: string; title: string };
type CatalogFilterRow = { id: string; title: string; slug: string; sortOrder: number };

@Component({
  selector: 'app-real-estate-filters-page',
  standalone: true,
  imports: [
    FormsModule,
    NgFor,
    NgIf,
    HelpPanelComponent,
    AdminModalComponent,
    AdminPaginationBarComponent,
    AdminFieldHintComponent,
  ],
  template: `
    <h1 class="page-title">Real estate filters</h1>
    <p class="page-intro">
      Define location-style tags per city. Then open each project under <strong>Real states</strong> and tick which tags apply — the public city page only lists tags that exist for that city.
    </p>
    <app-help-panel title="How this works">
      <app-admin-field-hint [text]="hint.realEstate" />
    </app-help-panel>

    <div class="admin-toolbar row-gap">
      <button type="button" class="btn btn-primary" [disabled]="!selectedCityId" (click)="openNewFilter()">
        Add a filter
      </button>
    </div>

    <div class="field">
      <label class="field-label-with-hint">
        City
        <app-admin-field-hint text="Filters belong to one destination. Projects in that city can be assigned any of its real-estate filters when you edit the project." />
      </label>
      <select [(ngModel)]="selectedCityId" (ngModelChange)="onCityChange()">
        <option value="">— Select city —</option>
        <option *ngFor="let c of cities" [value]="c.id">{{ c.title }} ({{ c.slug }})</option>
      </select>
    </div>

    <p class="err" *ngIf="error">{{ error }}</p>

    <div *ngIf="selectedCityId">
      <div class="admin-table-wrap-cards">
        <div class="admin-scroll">
          <table class="admin-table compact-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Sort</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of filterRows">
                <td>{{ row.title }}</td>
                <td><code>{{ row.slug }}</code></td>
                <td>{{ row.sortOrder }}</td>
                <td class="filter-row-actions">
                  <button type="button" class="btn btn-small" (click)="editFilter(row)">Edit</button>
                  <button type="button" class="btn btn-small btn-danger" (click)="deleteFilter(row)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <p *ngIf="!filterRows.length && !listLoading" class="muted-inline">No filters yet for this city.</p>
      <app-admin-pagination-bar
        itemLabel="filters"
        [page]="page"
        [pageSize]="pageSize"
        [total]="total"
        (pageChange)="onPage($event)"
      />
    </div>

    <app-admin-modal [(open)]="modalOpen" [title]="editingId ? 'Edit filter' : 'New filter'">
      <div class="modal-scroll-form">
        <div class="field">
          <label>Title</label>
          <input [(ngModel)]="form.title" />
        </div>
        <div class="field">
          <label>Slug</label>
          <input [(ngModel)]="form.slug" placeholder="e.g. marina" />
        </div>
        <div class="field">
          <label>Sort order</label>
          <input type="number" [(ngModel)]="form.sortOrder" />
        </div>
        <div class="admin-modal-actions">
          <button type="button" class="btn btn-primary" (click)="saveFilter()">Save</button>
          <button type="button" class="btn" (click)="closeModal()">Cancel</button>
        </div>
      </div>
    </app-admin-modal>
  `,
  styles: [
    `
      .row-gap {
        margin-bottom: 0.75rem;
      }
      .err {
        color: var(--admin-danger);
        margin: 0.5rem 0;
      }
      .compact-table {
        font-size: 0.82rem;
      }
      .compact-table th,
      .compact-table td {
        padding: 0.35rem 0.45rem;
      }
      .muted-inline {
        margin: 0.5rem 0;
        font-size: 0.82rem;
        color: var(--admin-muted);
      }
      .filter-row-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
      }
      .btn-small {
        font-size: 0.78rem;
        padding: 0.35rem 0.55rem;
      }
      .btn-danger {
        border-color: var(--admin-danger);
        color: var(--admin-danger);
        background: transparent;
      }
    `,
  ],
})
export class RealEstateFiltersPageComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly confirm = inject(AdminConfirmService);
  private readonly notice = inject(AdminNoticeService);

  readonly hint = LISTING_FILTERS_HINTS;

  readonly citiesPageSize = 500;
  cities: CityOpt[] = [];
  selectedCityId = '';

  readonly pageSize = 50;
  page = 1;
  total = 0;
  filterRows: CatalogFilterRow[] = [];
  listLoading = false;

  modalOpen = false;
  editingId: string | null = null;
  form = { title: '', slug: '', sortOrder: 0 };
  error = '';

  ngOnInit(): void {
    this.reloadCities();
  }

  reloadCities(): void {
    this.http
      .get<AdminPaginated<CityOpt>>(apiUrl('/api/admin/cities'), {
        params: { page: 1, pageSize: this.citiesPageSize },
      })
      .subscribe({
        next: (r) => {
          this.cities = [...r.items].sort((a, b) => a.title.localeCompare(b.title));
        },
        error: () => this.notice.error(ADMIN_MSG.loadList),
      });
  }

  onCityChange(): void {
    this.page = 1;
    this.filterRows = [];
    this.error = '';
    if (!this.selectedCityId) return;
    this.reloadFilters();
  }

  onPage(p: number): void {
    this.page = p;
    this.reloadFilters();
  }

  reloadFilters(): void {
    if (!this.selectedCityId) return;
    this.listLoading = true;
    this.http
      .get<AdminPaginated<CatalogFilterRow>>(
        apiUrl(`/api/admin/cities/${this.selectedCityId}/catalog-filters`),
        { params: { domain: 'REAL_ESTATE', page: this.page, pageSize: this.pageSize } },
      )
      .subscribe({
        next: (r) => {
          this.filterRows = r.items;
          this.total = r.total;
          this.listLoading = false;
          if (r.items.length === 0 && r.total > 0 && this.page > 1) {
            this.page--;
            this.reloadFilters();
          }
        },
        error: () => {
          this.listLoading = false;
          this.notice.error(ADMIN_MSG.loadList);
          this.filterRows = [];
        },
      });
  }

  openNewFilter(): void {
    if (!this.selectedCityId) return;
    this.editingId = null;
    this.form = { title: '', slug: '', sortOrder: 0 };
    this.modalOpen = true;
  }

  editFilter(row: CatalogFilterRow): void {
    this.editingId = row.id;
    this.form = { title: row.title, slug: row.slug, sortOrder: row.sortOrder };
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
    this.editingId = null;
    this.form = { title: '', slug: '', sortOrder: 0 };
  }

  saveFilter(): void {
    if (!this.selectedCityId) return;
    const title = this.form.title.trim();
    const slug = this.form.slug.trim();
    if (!title || !slug) {
      this.error = 'Please enter both a title and a slug.';
      return;
    }
    this.error = '';
    const body =
      this.editingId == null
        ? { title, slug, domain: 'REAL_ESTATE' as const }
        : { title, slug, sortOrder: Number(this.form.sortOrder) || 0 };
    const req =
      this.editingId == null
        ? this.http.post(apiUrl(`/api/admin/cities/${this.selectedCityId}/catalog-filters`), body)
        : this.http.put(apiUrl(`/api/admin/catalog-filters/${this.editingId}`), body);
    req.subscribe({
      next: () => {
        const wasEdit = this.editingId != null;
        this.closeModal();
        this.notice.success(wasEdit ? 'Filter updated.' : 'Filter added.');
        this.reloadFilters();
      },
      error: (e) => {
        this.error = adminApiErrorMessage(e, ADMIN_MSG.save);
      },
    });
  }

  deleteFilter(row: CatalogFilterRow): void {
    void this.deleteFilterAsync(row);
  }

  private async deleteFilterAsync(row: CatalogFilterRow): Promise<void> {
    if (!this.selectedCityId) return;
    try {
      const usage = await firstValueFrom(
        this.http.get<{ projectCount: number; tourCount: number }>(apiUrl(`/api/admin/catalog-filters/${row.id}/usage`)),
      );
      if (usage.projectCount > 0 || usage.tourCount > 0) {
        this.notice.error(
          `Cannot delete “${row.title}”: still assigned to ${usage.projectCount} project(s) and ${usage.tourCount} tour(s). Remove it from those records first.`,
        );
        return;
      }
    } catch {
      this.notice.error(ADMIN_MSG.loadList);
      return;
    }
    const ok = await this.confirm.open({
      title: 'Delete this filter?',
      message: `Remove “${row.title}” permanently?`,
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    this.error = '';
    this.http.delete(apiUrl(`/api/admin/catalog-filters/${row.id}`)).subscribe({
      next: () => {
        this.notice.success('Filter removed.');
        this.reloadFilters();
      },
      error: (e) => {
        this.error = adminApiErrorMessage(e, ADMIN_MSG.delete);
      },
    });
  }
}
