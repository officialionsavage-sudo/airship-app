import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ADMIN_MSG, adminApiErrorMessage } from '../../core/admin-messages';
import type { AdminPaginated } from '../../core/admin-paginated';
import { apiUrl } from '../../core/api-url';
import { AdminAuthService } from '../../core/admin-auth.service';
import { requireWriteAccess } from '../../core/admin-write-access';
import { AdminConfirmService } from '../../shared/admin-confirm/admin-confirm.service';
import { AdminNoticeService } from '../../shared/admin-notice/admin-notice.service';
import { AdminImageFieldComponent } from '../../shared/admin-image-field/admin-image-field.component';
import { AdminImageJsonArrayComponent } from '../../shared/admin-image-json-array/admin-image-json-array.component';
import { AdminModalComponent } from '../../shared/admin-modal/admin-modal.component';
import { AdminPaginationBarComponent } from '../../shared/admin-pagination-bar/admin-pagination-bar.component';
import { AdminFieldHintComponent } from '../../shared/admin-field-hint/admin-field-hint.component';
import { PROJECT_HINTS } from '../../shared/admin-field-hint/admin-field-hints.constants';
import { AdminStringListComponent } from '../../shared/admin-string-list/admin-string-list.component';
import { HelpPanelComponent } from '../../shared/help-panel/help-panel.component';

type ProjList = {
  id: string;
  slug: string;
  title: string;
  city: { slug: string };
  status: string;
  _count: { units: number };
};

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [
    FormsModule,
    NgFor,
    NgIf,
    RouterLink,
    HelpPanelComponent,
    AdminPaginationBarComponent,
    AdminModalComponent,
    AdminImageFieldComponent,
    AdminImageJsonArrayComponent,
    AdminStringListComponent,
    AdminFieldHintComponent,
  ],
  template: `
    <h1 class="page-title">Property projects</h1>
    <p class="page-intro">
      Each project is a development (compound or building) under a city. Use <strong>Open details</strong> to manage individual apartments or villas. Location filters for listing pages are set under
      <strong>Real estate filters</strong>.
    </p>
    <app-help-panel title="Deleting a project">
      Deleting removes all units under this project and its saved filter rows. Double-check before confirming.
    </app-help-panel>

    <div class="admin-toolbar">
      <button type="button" class="btn btn-primary" (click)="openNewProject()">Add a project</button>
    </div>

    <p *ngIf="listLoaded && projects.length === 0" class="admin-empty-state">
      No property projects yet. Click <strong>Add a project</strong>, choose the city, then fill in the marketing details.
    </p>

    <div class="admin-table-wrap-cards" *ngIf="listLoaded && projects.length > 0">
      <div class="admin-scroll">
        <table class="admin-table">
          <thead>
            <tr>
              <th scope="col">Link ending</th>
              <th scope="col">Project name</th>
              <th scope="col">City</th>
              <th scope="col">Units</th>
              <th scope="col" class="admin-col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of projects">
              <td><code>{{ p.slug }}</code></td>
              <td>{{ p.title }}</td>
              <td>{{ p.city.slug }}</td>
              <td>{{ p._count.units }}</td>
              <td class="row-actions">
                <a class="btn btn-small" [routerLink]="['/catalog/projects', p.id]">Open details</a>
                <button type="button" class="btn btn-small admin-mutate" (click)="openEditProject(p.id)">Edit</button>
                <button type="button" class="btn btn-small btn-danger admin-mutate" (click)="deleteProject(p)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="admin-cards">
        <div class="admin-card" *ngFor="let p of projects">
          <strong>{{ p.title }}</strong>
          <div>Link: <code>{{ p.slug }}</code> · City: {{ p.city.slug }} · {{ p._count.units }} units</div>
          <div class="card-actions">
            <a class="btn btn-small" [routerLink]="['/catalog/projects', p.id]">Open details</a>
            <button type="button" class="btn btn-small admin-mutate" (click)="openEditProject(p.id)">Edit</button>
            <button type="button" class="btn btn-small btn-danger admin-mutate" (click)="deleteProject(p)">Delete</button>
          </div>
        </div>
      </div>
    </div>
    <app-admin-pagination-bar
      itemLabel="projects"
      [page]="projectsPage"
      [pageSize]="pageSize"
      [total]="projectsTotal"
      (pageChange)="onProjectsPage($event)"
    />

    <app-admin-modal
      [(open)]="projectModalOpen"
      [title]="editingProjectId ? 'Edit project' : 'Add a new project'"
      [wide]="true"
    >
      <div class="modal-scroll-form">
        <div class="field">
          <label class="field-label-with-hint">
            Project link ending
            <app-admin-field-hint [text]="hint.slug" />
          </label>
          <input [(ngModel)]="pf.slug" placeholder="e.g. marina-heights" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            City
            <app-admin-field-hint [text]="hint.citySlug" />
          </label>
          <select [(ngModel)]="pf.citySlug" (ngModelChange)="onCitySlugChange()">
            <option value="">Choose a city…</option>
            <option *ngFor="let c of cityOptions" [value]="c.slug">{{ c.title }} ({{ c.slug }})</option>
          </select>
          <p class="filter-empty-hint" *ngIf="cityOptions.length === 0">
            No cities yet. Add one under <a routerLink="/catalog/cities">Catalog → Cities</a> first.
          </p>
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
            No filters yet for <strong>{{ filterCityLabel || pf.citySlug || 'this city' }}</strong>. Add them under
            <a routerLink="/catalog/real-estate-filters">Catalog → Real estate filters</a>, then open this form again.
          </p>
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Title
            <app-admin-field-hint [text]="hint.title" />
          </label>
          <input [(ngModel)]="pf.title" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Starting price
            <app-admin-field-hint [text]="hint.startingPrice" />
          </label>
          <input type="number" [(ngModel)]="pf.startingPrice" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Location name
            <app-admin-field-hint [text]="hint.locationName" />
          </label>
          <input [(ngModel)]="pf.locationName" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Location slug
            <app-admin-field-hint [text]="hint.locationSlug" />
          </label>
          <input [(ngModel)]="pf.locationSlug" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Status
            <app-admin-field-hint [text]="hint.status" />
          </label>
          <select [(ngModel)]="pf.status">
            <option value="launching">Launching</option>
            <option value="under-construction">Under construction</option>
            <option value="ready">Ready</option>
          </select>
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Property type
            <app-admin-field-hint [text]="hint.propertyType" />
          </label>
          <select [(ngModel)]="pf.propertyType">
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="townhouse">Townhouse</option>
            <option value="chalet">Chalet</option>
            <option value="studio">Studio</option>
          </select>
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Short description
            <app-admin-field-hint [text]="hint.shortDescription" />
          </label>
          <textarea [(ngModel)]="pf.shortDescription" rows="2"></textarea>
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Description
            <app-admin-field-hint [text]="hint.description" />
          </label>
          <textarea [(ngModel)]="pf.description" rows="3"></textarea>
        </div>
        <app-admin-image-json-array
          [(ngModel)]="pf.imagesJson"
          label="Gallery images"
          [fieldHint]="hint.gallery"
          [maxCount]="10"
        />
        <app-admin-image-field
          [(ngModel)]="pf.heroImageBase64"
          label="Hero image"
          [fieldHint]="hint.heroImage"
        />
        <app-admin-string-list
          [(ngModel)]="pf.features"
          label="Features (one per line)"
          [fieldHint]="hint.features"
        />
        <app-admin-string-list
          [(ngModel)]="pf.amenities"
          label="Amenities (one per line)"
          [fieldHint]="hint.amenities"
        />
        <div class="field">
          <label class="field-label-with-hint">
            Developer
            <app-admin-field-hint [text]="hint.developerName" />
          </label>
          <input [(ngModel)]="pf.developerName" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Map embed URL
            <app-admin-field-hint [text]="hint.mapEmbedUrl" />
          </label>
          <input [(ngModel)]="pf.mapEmbedUrl" />
        </div>
        <p class="err" *ngIf="error">{{ error }}</p>
        <div class="admin-modal-actions">
          <button type="button" class="btn btn-primary" (click)="saveProject()">
            {{ editingProjectId ? 'Save changes' : 'Create project' }}
          </button>
          <button type="button" class="btn" (click)="closeModal()">Close</button>
        </div>
      </div>
    </app-admin-modal>
  `,
  styles: [
    `
      a.btn {
        display: inline-flex;
        text-decoration: none;
        text-align: center;
      }
      .row-actions,
      .card-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
        align-items: center;
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
      .card-actions {
        margin-top: 0.5rem;
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
export class ProjectsPageComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AdminAuthService);
  private readonly confirm = inject(AdminConfirmService);
  private readonly notice = inject(AdminNoticeService);

  readonly hint = PROJECT_HINTS;
  readonly pageSize = 20;

  projects: ProjList[] = [];
  projectsPage = 1;
  projectsTotal = 0;
  listLoaded = false;
  error = '';

  projectModalOpen = false;
  editingProjectId: string | null = null;
  pf = this.emptyProjectForm();

  realEstateFilterOptions: { id: string; title: string; slug: string }[] = [];
  filtersLoading = false;
  filterOptionsError = '';
  filterCityLabel = '';
  cityOptions: { id: string; slug: string; title: string }[] = [];
  private citySlugToId = new Map<string, string>();

  ngOnInit(): void {
    this.reloadList();
    this.loadCitySlugMap();
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

  onCitySlugChange(): void {
    const slug = this.pf.citySlug.trim().toLowerCase();
    const cityId = slug ? this.citySlugToId.get(slug) : undefined;
    const picked = this.cityOptions.find((c) => c.slug.toLowerCase() === slug);
    if (cityId) {
      this.filterCityLabel = picked?.title ?? slug;
      this.loadRealEstateFilterOptions(cityId);
    } else {
      this.realEstateFilterOptions = [];
      this.filterOptionsError = '';
      this.filterCityLabel = '';
    }
  }

  private loadCitySlugMap(): void {
    this.http
      .get<AdminPaginated<{ id: string; slug: string; title: string }>>(apiUrl('/api/admin/cities'), {
        params: { page: '1', pageSize: '200' },
      })
      .subscribe({
        next: (r) => {
          const items = r.items ?? [];
          this.cityOptions = [...items].sort((a, b) => a.title.localeCompare(b.title));
          this.citySlugToId = new Map(items.map((c) => [c.slug.toLowerCase(), c.id]));
        },
        error: () => {
          this.cityOptions = [];
          this.citySlugToId = new Map();
        },
      });
  }

  private loadRealEstateFilterOptions(cityId: string): void {
    this.realEstateFilterOptions = [];
    this.filterOptionsError = '';
    if (!cityId) {
      this.filterOptionsError = 'Select a valid city first.';
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

  onProjectsPage(p: number): void {
    this.projectsPage = p;
    this.reloadList();
  }

  reloadList(): void {
    this.http
      .get<AdminPaginated<ProjList>>(apiUrl('/api/admin/projects'), {
        params: { page: this.projectsPage, pageSize: this.pageSize },
      })
      .subscribe({
        next: (r) => {
          this.listLoaded = true;
          this.projects = r.items;
          this.projectsTotal = r.total;
          this.error = '';
          if (r.items.length === 0 && r.total > 0 && this.projectsPage > 1) {
            this.projectsPage--;
            this.reloadList();
          }
        },
        error: () => {
          this.listLoaded = true;
          this.notice.error(ADMIN_MSG.loadList);
        },
      });
  }

  emptyProjectForm() {
    return {
      slug: '',
      citySlug: '',
      title: '',
      startingPrice: null as number | null,
      locationName: 'Main',
      locationSlug: 'main',
      status: 'ready' as 'launching' | 'under-construction' | 'ready',
      propertyType: 'apartment' as 'apartment' | 'villa' | 'townhouse' | 'chalet' | 'studio',
      description: '',
      shortDescription: '',
      imagesJson: '[]',
      heroImageBase64: '',
      features: [] as string[],
      amenities: [] as string[],
      developerName: 'TBD',
      mapEmbedUrl: 'https://example.com/',
      catalogFilterIds: [] as string[],
    };
  }

  openNewProject(): void {
    if (!requireWriteAccess(this.auth, this.notice)) {
      return;
    }
    this.editingProjectId = null;
    this.pf = this.emptyProjectForm();
    this.error = '';
    this.filterOptionsError = '';
    this.realEstateFilterOptions = [];
    this.filterCityLabel = '';
    this.projectModalOpen = true;
  }

  openEditProject(id: string): void {
    if (!requireWriteAccess(this.auth, this.notice)) {
      return;
    }
    this.error = '';
    this.filterOptionsError = '';
    this.http.get<any>(apiUrl(`/api/admin/projects/${id}`)).subscribe({
      next: (p) => {
        this.editingProjectId = id;
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
        this.filterCityLabel = p.city?.title ?? p.city?.slug ?? '';
        const cityId = p.city?.id ?? '';
        if (cityId) {
          this.loadRealEstateFilterOptions(cityId);
        }
        this.projectModalOpen = true;
      },
      error: (e) => {
        this.error = adminApiErrorMessage(e, ADMIN_MSG.loadDetail);
      },
    });
  }

  closeModal(): void {
    this.projectModalOpen = false;
    this.editingProjectId = null;
    this.pf = this.emptyProjectForm();
    this.realEstateFilterOptions = [];
    this.filterOptionsError = '';
    this.filterCityLabel = '';
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
    if (!requireWriteAccess(this.auth, this.notice)) {
      return;
    }
    const ok = await this.confirm.open({
      title: this.editingProjectId ? 'Save project?' : 'Create project?',
      message: this.editingProjectId
        ? 'Updates will show on the live website after saving.'
        : 'The new project will appear under the chosen city.',
      confirmLabel: this.editingProjectId ? 'Save changes' : 'Create project',
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
    this.error = '';
    const req = this.editingProjectId
      ? this.http.put(apiUrl(`/api/admin/projects/${this.editingProjectId}`), body)
      : this.http.post(apiUrl('/api/admin/projects'), body);
    req.subscribe({
      next: () => {
        const wasEditing = !!this.editingProjectId;
        this.closeModal();
        this.notice.success(wasEditing ? 'Project saved. Visitors will see your updates.' : 'Project created.');
        this.reloadList();
      },
      error: (e) => {
        this.error = adminApiErrorMessage(e, ADMIN_MSG.save);
      },
    });
  }

  deleteProject(p: ProjList): void {
    void this.deleteProjectAsync(p);
  }

  private async deleteProjectAsync(p: ProjList): Promise<void> {
    if (!requireWriteAccess(this.auth, this.notice)) {
      return;
    }
    const ok = await this.confirm.open({
      title: 'Delete this project?',
      message: `"${p.title}" and all ${p._count.units} unit(s) will be permanently removed. This cannot be undone.`,
      confirmLabel: 'Yes, delete',
    });
    if (!ok) {
      return;
    }
    this.error = '';
    this.http.delete(apiUrl(`/api/admin/projects/${p.id}`)).subscribe({
      next: () => {
        this.notice.success('Project deleted.');
        this.reloadList();
      },
      error: (e) => {
        this.notice.error(adminApiErrorMessage(e, ADMIN_MSG.delete));
      },
    });
  }
}
