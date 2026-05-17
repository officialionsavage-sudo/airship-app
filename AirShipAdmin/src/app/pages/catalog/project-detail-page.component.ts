import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { finalize } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ADMIN_MSG, adminApiErrorMessage } from '../../core/admin-messages';
import type { AdminPaginated } from '../../core/admin-paginated';
import { apiUrl } from '../../core/api-url';
import { AdminConfirmService } from '../../shared/admin-confirm/admin-confirm.service';
import { AdminNoticeService } from '../../shared/admin-notice/admin-notice.service';
import { AdminImageFieldComponent } from '../../shared/admin-image-field/admin-image-field.component';
import { AdminImageJsonArrayComponent } from '../../shared/admin-image-json-array/admin-image-json-array.component';
import { AdminModalComponent } from '../../shared/admin-modal/admin-modal.component';
import { AdminPaginationBarComponent } from '../../shared/admin-pagination-bar/admin-pagination-bar.component';
import { AdminFieldHintComponent } from '../../shared/admin-field-hint/admin-field-hint.component';
import { PROJECT_HINTS, UNIT_HINTS } from '../../shared/admin-field-hint/admin-field-hints.constants';
import { AdminStringListComponent } from '../../shared/admin-string-list/admin-string-list.component';
import { HelpPanelComponent } from '../../shared/help-panel/help-panel.component';

type UnitRow = {
  id: string;
  slug: string;
  title: string;
  size: number;
  beds: number;
  baths: number;
};

type ProjectDetail = {
  id: string;
  slug: string;
  title: string;
  status: string;
  propertyType: string;
  shortDescription: string;
  description: string;
  startingPrice: number | null;
  locationName: string;
  locationSlug: string;
  developerName: string;
  mapEmbedUrl: string;
  city: { id: string; slug: string; title?: string };
  _count: { units: number };
};

@Component({
  selector: 'app-project-detail-page',
  standalone: true,
  imports: [
    FormsModule,
    NgFor,
    NgIf,
    RouterLink,
    HelpPanelComponent,
    AdminImageFieldComponent,
    AdminImageJsonArrayComponent,
    AdminModalComponent,
    AdminPaginationBarComponent,
    AdminStringListComponent,
    AdminFieldHintComponent,
  ],
  template: `
    <a routerLink="/catalog/projects" class="back">← Back to all projects</a>
    <h1 class="page-title" *ngIf="detail">{{ detail.title }}</h1>
    <h1 class="page-title" *ngIf="!detail && !loadError">Loading…</h1>

    <app-help-panel title="This screen">
      Update the whole development here, or scroll down to add and edit individual apartments / villas. Saving publishes changes to the live website.
    </app-help-panel>

    <p class="err" *ngIf="loadError">{{ loadError }}</p>

    <section class="project-card" *ngIf="detail">
      <div class="project-card-head">
        <div>
          <p class="eyebrow">Project</p>
          <h2 class="project-title">{{ detail.title }}</h2>
          <p class="meta">
            <span><strong>Link ending</strong> <code>{{ detail.slug }}</code></span>
            <span><strong>City</strong> {{ detail.city.slug }}</span>
            <span><strong>Status</strong> {{ displayStatus(detail.status) }}</span>
            <span><strong>Type</strong> {{ displayPropertyType(detail.propertyType) }}</span>
            <span><strong>Units</strong> {{ detail._count.units }}</span>
          </p>
        </div>
        <button type="button" class="btn btn-primary" (click)="openEditProject()">Edit project details</button>
      </div>
      <p class="short" *ngIf="detail.shortDescription">{{ detail.shortDescription }}</p>
      <div class="desc" *ngIf="detail.description">
        <strong>Description</strong>
        <p>{{ detail.description }}</p>
      </div>
    </section>

    <section class="units-board" *ngIf="projectId">
      <div class="units-head">
        <h2>Units in this project</h2>
        <button type="button" class="btn btn-primary" (click)="openNewUnit()">Add a unit</button>
      </div>
      <div class="admin-scroll">
        <table class="admin-table units-table">
          <thead>
            <tr>
              <th>Link ending</th>
              <th>Unit name</th>
              <th>Size</th>
              <th>Beds</th>
              <th>Baths</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of units">
              <td>{{ u.slug }}</td>
              <td>{{ u.title }}</td>
              <td>{{ u.size }}</td>
              <td>{{ u.beds }}</td>
              <td>{{ u.baths }}</td>
              <td class="unit-actions">
                <button type="button" class="btn btn-small" (click)="pickUnit(u)">Edit</button>
                <button type="button" class="btn btn-small btn-danger" (click)="deleteUnit(u)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <app-admin-pagination-bar
        itemLabel="units"
        [page]="unitsPage"
        [pageSize]="pageSize"
        [total]="unitsTotal"
        (pageChange)="onUnitsPage($event)"
      />
      <p class="err" *ngIf="error">{{ error }}</p>
    </section>

    <app-admin-modal [(open)]="projectModalOpen" title="Edit project details" [wide]="true">
      <div class="modal-scroll-form">
        <div class="field">
          <label class="field-label-with-hint">
            Slug
            <app-admin-field-hint [text]="projHint.slug" />
          </label>
          <input [(ngModel)]="pf.slug" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            City slug
            <app-admin-field-hint [text]="projHint.citySlug" />
          </label>
          <input [(ngModel)]="pf.citySlug" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Title
            <app-admin-field-hint [text]="projHint.title" />
          </label>
          <input [(ngModel)]="pf.title" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Starting price
            <app-admin-field-hint [text]="projHint.startingPrice" />
          </label>
          <input type="number" [(ngModel)]="pf.startingPrice" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Location name
            <app-admin-field-hint [text]="projHint.locationName" />
          </label>
          <input [(ngModel)]="pf.locationName" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Location slug
            <app-admin-field-hint [text]="projHint.locationSlug" />
          </label>
          <input [(ngModel)]="pf.locationSlug" />
        </div>
        <div class="field">
          <span class="field-label-with-hint">
            Listing filters
            <app-admin-field-hint text="Shown as chips on the public city projects page. Create tags under Catalog → Real estate filters (same city), then tick them here." />
          </span>
          <p class="filter-status" *ngIf="filtersLoading">Loading filters…</p>
          <p class="err filter-status" *ngIf="!filtersLoading && filterOptionsError">{{ filterOptionsError }}</p>
          <div class="filter-chk-grid" *ngIf="!filtersLoading && !filterOptionsError && realEstateFilterOptions.length">
            <label class="filter-chk" *ngFor="let opt of realEstateFilterOptions">
              <input type="checkbox" [checked]="filterChecked(opt.id)" (change)="toggleProjectFilter(opt.id, $event)" />
              <span>{{ opt.title }} <code>{{ opt.slug }}</code></span>
            </label>
          </div>
          <p class="filter-empty-hint" *ngIf="!filtersLoading && !filterOptionsError && !realEstateFilterOptions.length">
            No filters exist yet for <strong>{{ detail?.city?.title || detail?.city?.slug }}</strong>. Add them under
            <a routerLink="/catalog/real-estate-filters">Catalog → Real estate filters</a>
            (select this city), then open this dialog again to assign tags to this project.
          </p>
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Status
            <app-admin-field-hint [text]="projHint.status" />
          </label>
          <select [(ngModel)]="pf.status">
            <option value="launching">launching</option>
            <option value="under-construction">under-construction</option>
            <option value="ready">ready</option>
          </select>
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Property type
            <app-admin-field-hint [text]="projHint.propertyType" />
          </label>
          <select [(ngModel)]="pf.propertyType">
            <option value="apartment">apartment</option>
            <option value="villa">villa</option>
            <option value="townhouse">townhouse</option>
            <option value="chalet">chalet</option>
            <option value="studio">studio</option>
          </select>
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Short description
            <app-admin-field-hint [text]="projHint.shortDescription" />
          </label>
          <textarea [(ngModel)]="pf.shortDescription" rows="2"></textarea>
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Description
            <app-admin-field-hint [text]="projHint.description" />
          </label>
          <textarea [(ngModel)]="pf.description" rows="3"></textarea>
        </div>
        <app-admin-image-json-array
          [(ngModel)]="pf.imagesJson"
          label="Gallery images"
          [fieldHint]="projHint.gallery"
          [maxCount]="10"
        />
        <app-admin-image-field
          [(ngModel)]="pf.heroImageBase64"
          label="Hero image"
          [fieldHint]="projHint.heroImage"
        />
        <app-admin-string-list
          [(ngModel)]="pf.features"
          label="Features (one per line)"
          [fieldHint]="projHint.features"
        />
        <app-admin-string-list
          [(ngModel)]="pf.amenities"
          label="Amenities (one per line)"
          [fieldHint]="projHint.amenities"
        />
        <div class="field">
          <label class="field-label-with-hint">
            Developer
            <app-admin-field-hint [text]="projHint.developerName" />
          </label>
          <input [(ngModel)]="pf.developerName" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Map embed URL
            <app-admin-field-hint [text]="projHint.mapEmbedUrl" />
          </label>
          <input [(ngModel)]="pf.mapEmbedUrl" />
        </div>
        <div class="admin-modal-actions">
          <button type="button" class="btn btn-primary" (click)="saveProject()">Save project</button>
          <button type="button" class="btn" (click)="projectModalOpen = false">Close</button>
        </div>
      </div>
    </app-admin-modal>

    <app-admin-modal [(open)]="unitModalOpen" [title]="uf.id ? 'Edit unit' : 'New unit'" [wide]="true">
      <div class="modal-scroll-form">
        <div class="field">
          <label class="field-label-with-hint">
            Slug
            <app-admin-field-hint [text]="unitHint.slug" />
          </label>
          <input [(ngModel)]="uf.slug" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Title
            <app-admin-field-hint [text]="unitHint.title" />
          </label>
          <input [(ngModel)]="uf.title" />
        </div>
        <app-admin-image-json-array
          [(ngModel)]="uf.imagesJson"
          label="Unit gallery images"
          [fieldHint]="unitHint.gallery"
          [maxCount]="10"
        />
        <div class="field">
          <label class="field-label-with-hint">
            Size
            <app-admin-field-hint [text]="unitHint.size" />
          </label>
          <input type="number" [(ngModel)]="uf.size" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Beds
            <app-admin-field-hint [text]="unitHint.beds" />
          </label>
          <input type="number" [(ngModel)]="uf.beds" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Baths
            <app-admin-field-hint [text]="unitHint.baths" />
          </label>
          <input type="number" [(ngModel)]="uf.baths" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Description
            <app-admin-field-hint [text]="unitHint.description" />
          </label>
          <textarea [(ngModel)]="uf.description" rows="2"></textarea>
        </div>
        <app-admin-string-list
          [(ngModel)]="uf.features"
          label="Features (one per line)"
          [fieldHint]="unitHint.features"
        />
        <div class="field">
          <label class="field-label-with-hint">
            Price / day
            <app-admin-field-hint [text]="unitHint.pricePerDay" />
          </label>
          <input type="number" [(ngModel)]="uf.pricePerDay" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Price / week
            <app-admin-field-hint [text]="unitHint.pricePerWeek" />
          </label>
          <input type="number" [(ngModel)]="uf.pricePerWeek" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Price / month
            <app-admin-field-hint [text]="unitHint.pricePerMonth" />
          </label>
          <input type="number" [(ngModel)]="uf.pricePerMonth" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Discount day %
            <app-admin-field-hint [text]="unitHint.discountDay" />
          </label>
          <input type="number" [(ngModel)]="uf.discountDay" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Discount week %
            <app-admin-field-hint [text]="unitHint.discountWeek" />
          </label>
          <input type="number" [(ngModel)]="uf.discountWeek" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Discount month %
            <app-admin-field-hint [text]="unitHint.discountMonth" />
          </label>
          <input type="number" [(ngModel)]="uf.discountMonth" />
        </div>
        <div class="admin-modal-actions">
          <button type="button" class="btn btn-primary" (click)="saveUnit()">Save unit</button>
          <button type="button" class="btn" (click)="unitModalOpen = false">Cancel</button>
        </div>
      </div>
    </app-admin-modal>
  `,
  styles: [
    `
      .back {
        display: inline-block;
        margin-bottom: 0.75rem;
        color: var(--admin-accent);
        text-decoration: none;
        font-size: 0.88rem;
      }
      .back:hover {
        text-decoration: underline;
      }
      .project-card {
        margin-bottom: 1.25rem;
        padding: 1.1rem;
        border-radius: 12px;
        border: 1px solid var(--admin-border);
        background: var(--admin-surface);
      }
      .project-card-head {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.75rem;
      }
      .eyebrow {
        margin: 0 0 0.25rem;
        font-size: 0.72rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--admin-muted);
      }
      .project-title {
        margin: 0 0 0.45rem;
        font-size: 1.25rem;
      }
      .meta {
        margin: 0;
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem 1rem;
        font-size: 0.82rem;
        color: var(--admin-muted);
      }
      .short {
        margin: 0.85rem 0 0;
        font-size: 0.92rem;
        line-height: 1.45;
      }
      .desc {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--admin-border);
        font-size: 0.88rem;
      }
      .desc p {
        margin: 0.35rem 0 0;
        white-space: pre-wrap;
        line-height: 1.45;
      }
      .units-board {
        padding: 1rem;
        border-radius: 12px;
        border: 1px solid var(--admin-border);
        background: var(--admin-surface);
      }
      .units-head {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.65rem;
        margin-bottom: 0.65rem;
      }
      .units-head h2 {
        margin: 0;
        font-size: 1.05rem;
      }
      .units-table {
        margin-bottom: 0.5rem;
      }
      .unit-actions {
        white-space: nowrap;
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
      }
      .btn-small {
        font-size: 0.75rem;
        padding: 0.3rem 0.55rem;
      }
      .btn-danger {
        border-color: var(--admin-danger);
        color: var(--admin-danger);
        background: transparent;
      }
      .filter-chk-grid {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        margin-top: 0.35rem;
      }
      .filter-chk {
        display: flex;
        align-items: flex-start;
        gap: 0.4rem;
        font-size: 0.84rem;
      }
      .filter-chk code {
        font-size: 0.78em;
      }
      .filter-status {
        margin: 0.35rem 0 0;
        font-size: 0.84rem;
        color: var(--admin-muted);
      }
      .filter-empty-hint {
        margin: 0.35rem 0 0;
        font-size: 0.84rem;
        line-height: 1.45;
        color: var(--admin-muted);
      }
      .filter-empty-hint a {
        color: var(--admin-accent);
        text-decoration: underline;
      }
      .err {
        color: var(--admin-danger);
      }
    `,
  ],
})
export class ProjectDetailPageComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly confirm = inject(AdminConfirmService);
  private readonly notice = inject(AdminNoticeService);

  readonly projHint = PROJECT_HINTS;
  readonly unitHint = UNIT_HINTS;
  readonly pageSize = 20;

  projectId = '';
  detail: ProjectDetail | null = null;
  loadError = '';

  units: UnitRow[] = [];
  unitsPage = 1;
  unitsTotal = 0;

  pf = this.emptyProjectForm();

  realEstateFilterOptions: { id: string; title: string; slug: string }[] = [];
  filtersLoading = false;
  filterOptionsError = '';
  uf = this.emptyUnitForm();
  error = '';
  projectModalOpen = false;
  unitModalOpen = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('projectId') ?? '';
      this.projectId = id;
      if (!id) {
        this.loadError = 'Invalid link — go back to the project list and open a project again.';
        return;
      }
      this.unitsPage = 1;
      this.loadProject(id);
      this.fetchUnits();
    });
  }

  displayStatus(s: string): string {
    if (s === 'under_construction') return 'Under construction';
    if (s === 'launching') return 'Launching';
    return 'Ready';
  }

  displayPropertyType(t: string): string {
    const map: Record<string, string> = {
      apartment: 'Apartment',
      villa: 'Villa',
      townhouse: 'Townhouse',
      chalet: 'Chalet',
      studio: 'Studio',
    };
    return map[t] ?? t;
  }

  onUnitsPage(p: number): void {
    this.unitsPage = p;
    this.fetchUnits();
  }

  openEditProject(): void {
    if (!this.detail) {
      return;
    }
    this.filterOptionsError = '';
    this.projectModalOpen = true;
    this.loadRealEstateFilterOptions(this.detail.city.id);
  }

  filterChecked(id: string): boolean {
    return this.pf.catalogFilterIds.includes(id);
  }

  toggleProjectFilter(id: string, ev: Event): void {
    const input = ev.target as HTMLInputElement | null;
    const checked = !!input?.checked;
    if (checked) {
      if (!this.pf.catalogFilterIds.includes(id)) {
        this.pf.catalogFilterIds = [...this.pf.catalogFilterIds, id];
      }
    } else {
      this.pf.catalogFilterIds = this.pf.catalogFilterIds.filter((x) => x !== id);
    }
  }

  private loadRealEstateFilterOptions(cityId: string): void {
    this.realEstateFilterOptions = [];
    this.filterOptionsError = '';
    if (!cityId) {
      this.filterOptionsError =
        'This project has no linked city id. Save the project with a valid city slug, then try again.';
      return;
    }
    this.filtersLoading = true;
    this.http
      .get<AdminPaginated<{ id: string; title: string; slug: string }>>(
        apiUrl(`/api/admin/cities/${cityId}/catalog-filters`),
        { params: { domain: 'REAL_ESTATE', page: '1', pageSize: '200' } },
      )
      .pipe(finalize(() => (this.filtersLoading = false)))
      .subscribe({
        next: (r) => {
          this.realEstateFilterOptions = r.items ?? [];
        },
        error: (e) => {
          this.realEstateFilterOptions = [];
          this.filterOptionsError = adminApiErrorMessage(e, 'Could not load listing filters.');
        },
      });
  }

  private loadProject(id: string): void {
    this.loadError = '';
    this.http.get<any>(apiUrl(`/api/admin/projects/${id}`)).subscribe({
      next: (p) => {
        this.detail = {
          id: p.id,
          slug: p.slug,
          title: p.title,
          status: p.status,
          propertyType: p.propertyType,
          shortDescription: p.shortDescription ?? '',
          description: p.description ?? '',
          startingPrice: p.startingPrice ?? null,
          locationName: p.locationName ?? '',
          locationSlug: p.locationSlug ?? '',
          developerName: p.developerName ?? '',
          mapEmbedUrl: p.mapEmbedUrl ?? '',
          city: { id: p.city?.id ?? '', slug: p.city?.slug ?? '', title: p.city?.title },
          _count: p._count ?? { units: 0 },
        };
        this.populateFormFromApiResponse(p);
      },
      error: () => {
        this.detail = null;
        this.loadError = 'This project could not be loaded. It may have been deleted — use the back link above.';
        this.notice.error(ADMIN_MSG.loadDetail);
      },
    });
  }

  private populateFormFromApiResponse(p: any): void {
    this.pf = {
      slug: p.slug,
      citySlug: p.city?.slug ?? '',
      title: p.title,
      startingPrice: p.startingPrice ?? null,
      locationName: p.locationName,
      locationSlug: p.locationSlug,
      status: p.status === 'under_construction' ? 'under-construction' : p.status,
      propertyType: p.propertyType,
      description: p.description,
      shortDescription: p.shortDescription,
      imagesJson: JSON.stringify(p.images ?? [], null, 2),
      heroImageBase64: p.heroImageBase64 ?? '',
      features: Array.isArray(p.features) ? [...p.features.map((x: unknown) => String(x))] : [],
      amenities: Array.isArray(p.amenities) ? [...p.amenities.map((x: unknown) => String(x))] : [],
      developerName: p.developerName,
      mapEmbedUrl: p.mapEmbedUrl,
      catalogFilterIds: Array.isArray(p.catalogFilterIds) ? [...p.catalogFilterIds.map(String)] : [],
    };
  }

  emptyProjectForm() {
    return {
      slug: '',
      citySlug: '',
      title: '',
      startingPrice: null as number | null,
      locationName: '',
      locationSlug: '',
      status: 'ready' as 'launching' | 'under-construction' | 'ready',
      propertyType: 'apartment' as 'apartment' | 'villa' | 'townhouse' | 'chalet' | 'studio',
      description: '',
      shortDescription: '',
      imagesJson: '[]',
      heroImageBase64: '',
      features: [] as string[],
      amenities: [] as string[],
      developerName: '',
      mapEmbedUrl: '',
      catalogFilterIds: [] as string[],
    };
  }

  emptyUnitForm() {
    return {
      id: '' as string,
      slug: '',
      title: '',
      imagesJson: '[]',
      size: 0,
      beds: 0,
      baths: 0,
      description: '',
      features: [] as string[],
      pricePerDay: 0,
      pricePerWeek: 0,
      pricePerMonth: 0,
      discountDay: 0,
      discountWeek: 0,
      discountMonth: 0,
    };
  }

  fetchUnits(): void {
    if (!this.projectId) {
      return;
    }
    this.http
      .get<AdminPaginated<UnitRow>>(apiUrl(`/api/admin/projects/${this.projectId}/units`), {
        params: { page: this.unitsPage, pageSize: this.pageSize },
      })
      .subscribe({
        next: (r) => {
          this.units = r.items;
          this.unitsTotal = r.total;
          if (r.items.length === 0 && r.total > 0 && this.unitsPage > 1) {
            this.unitsPage--;
            this.fetchUnits();
          }
        },
        error: () => this.notice.error('Could not load the unit list. Try refreshing.'),
      });
  }

  private rewindUnitsIfEmpty(itemCount: number, total: number): void {
    if (itemCount === 0 && total > 0 && this.unitsPage > 1) {
      this.unitsPage--;
      this.fetchUnits();
    }
  }

  parseImagesJson(json: string): string[] | null {
    try {
      const v = JSON.parse(json);
      return Array.isArray(v) ? v.map((x) => String(x)) : null;
    } catch {
      this.error = ADMIN_MSG.galleryJson;
      return null;
    }
  }

  saveProject(): void {
    void this.saveProjectAsync();
  }

  private async saveProjectAsync(): Promise<void> {
    if (!this.projectId) {
      return;
    }
    const ok = await this.confirm.open({
      title: 'Save project?',
      message: 'Visitors will see these updates on the live website.',
      confirmLabel: 'Save changes',
    });
    if (!ok) {
      return;
    }
    const images = this.parseImagesJson(this.pf.imagesJson);
    if (!images) {
      return;
    }
    if (images.length > 10) {
      this.error = ADMIN_MSG.galleryMax;
      return;
    }
    this.error = '';
    const body = {
      slug: this.pf.slug.trim(),
      citySlug: this.pf.citySlug.trim(),
      title: this.pf.title,
      startingPrice: this.pf.startingPrice,
      locationName: this.pf.locationName,
      locationSlug: this.pf.locationSlug,
      status: this.pf.status,
      propertyType: this.pf.propertyType,
      description: this.pf.description,
      shortDescription: this.pf.shortDescription,
      images,
      heroImageBase64: this.pf.heroImageBase64,
      features: this.pf.features.map((s) => s.trim()).filter(Boolean),
      amenities: this.pf.amenities.map((s) => s.trim()).filter(Boolean),
      developerName: this.pf.developerName,
      mapEmbedUrl: this.pf.mapEmbedUrl,
      videoUrl: '',
      catalogFilterIds: this.pf.catalogFilterIds,
    };
    this.http.put(apiUrl(`/api/admin/projects/${this.projectId}`), body).subscribe({
      next: () => {
        this.projectModalOpen = false;
        this.notice.success('Project saved.');
        this.loadProject(this.projectId);
      },
      error: (e) => {
        this.error = adminApiErrorMessage(e, ADMIN_MSG.save);
      },
    });
  }

  openNewUnit(): void {
    this.uf = this.emptyUnitForm();
    this.unitModalOpen = true;
  }

  pickUnit(u: UnitRow): void {
    this.error = '';
    this.http.get<any>(apiUrl(`/api/admin/units/${u.id}`)).subscribe({
      next: (row) => {
        this.uf = {
          id: row.id,
          slug: row.slug,
          title: row.title,
          imagesJson: JSON.stringify(row.images ?? [], null, 2),
          size: row.size,
          beds: row.beds,
          baths: row.baths,
          description: row.description,
          features: Array.isArray(row.features) ? [...row.features.map((x: unknown) => String(x))] : [],
          pricePerDay: row.pricePerDay,
          pricePerWeek: row.pricePerWeek,
          pricePerMonth: row.pricePerMonth,
          discountDay: row.discountDay,
          discountWeek: row.discountWeek,
          discountMonth: row.discountMonth,
        };
        this.unitModalOpen = true;
      },
      error: (e) => {
        this.error = adminApiErrorMessage(e, ADMIN_MSG.loadDetail);
      },
    });
  }

  deleteUnit(u: UnitRow): void {
    void this.deleteUnitAsync(u);
  }

  private async deleteUnitAsync(u: UnitRow): Promise<void> {
    const ok = await this.confirm.open({
      title: 'Delete this unit?',
      message: `Remove “${u.title}” (${u.slug}) permanently? This cannot be undone.`,
      confirmLabel: 'Yes, delete',
    });
    if (!ok) {
      return;
    }
    this.error = '';
    this.http.delete(apiUrl(`/api/admin/units/${u.id}`)).subscribe({
      next: () => {
        this.loadProject(this.projectId);
        this.http
          .get<AdminPaginated<UnitRow>>(apiUrl(`/api/admin/projects/${this.projectId}/units`), {
            params: { page: this.unitsPage, pageSize: this.pageSize },
          })
          .subscribe({
            next: (r) => {
              this.units = r.items;
              this.unitsTotal = r.total;
              this.rewindUnitsIfEmpty(r.items.length, r.total);
            },
            error: () => this.notice.error('Unit deleted, but the list could not refresh. Reload the page.'),
          });
        this.notice.success('Unit deleted.');
      },
      error: (e) => {
        this.error = adminApiErrorMessage(e, ADMIN_MSG.delete);
      },
    });
  }

  saveUnit(): void {
    void this.saveUnitAsync();
  }

  private async saveUnitAsync(): Promise<void> {
    if (!this.projectId) {
      return;
    }
    const ok = await this.confirm.open({
      title: this.uf.id ? 'Save unit?' : 'Add unit?',
      message: this.uf.id ? 'Updates go live after saving.' : 'The unit will appear under this project.',
      confirmLabel: this.uf.id ? 'Save changes' : 'Create unit',
    });
    if (!ok) {
      return;
    }
    const images = this.parseImagesJson(this.uf.imagesJson);
    if (!images) {
      return;
    }
    if (images.length > 10) {
      this.error = ADMIN_MSG.galleryMax;
      return;
    }
    const body = {
      slug: this.uf.slug.trim(),
      title: this.uf.title,
      images,
      size: Number(this.uf.size),
      beds: Number(this.uf.beds),
      baths: Number(this.uf.baths),
      description: this.uf.description,
      features: this.uf.features.map((s) => s.trim()).filter(Boolean),
      pricePerDay: Number(this.uf.pricePerDay),
      pricePerWeek: Number(this.uf.pricePerWeek),
      pricePerMonth: Number(this.uf.pricePerMonth),
      discountDay: Number(this.uf.discountDay),
      discountWeek: Number(this.uf.discountWeek),
      discountMonth: Number(this.uf.discountMonth),
    };
    this.error = '';
    const req = this.uf.id
      ? this.http.put(apiUrl(`/api/admin/units/${this.uf.id}`), body)
      : this.http.post(apiUrl(`/api/admin/projects/${this.projectId}/units`), body);
    req.subscribe({
      next: () => {
        const wasEdit = Boolean(this.uf.id);
        this.unitModalOpen = false;
        this.uf = this.emptyUnitForm();
        this.notice.success(wasEdit ? 'Unit saved.' : 'Unit created.');
        this.loadProject(this.projectId);
        this.fetchUnits();
      },
      error: (e) => {
        this.error = adminApiErrorMessage(e, ADMIN_MSG.save);
      },
    });
  }
}
