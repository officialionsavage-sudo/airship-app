import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  HOME_PAGE_DEFAULTS,
  bundledHomeToStorageV2,
  migrateRawHomeToBundled,
} from '@airship-public/home-page.defaults';
import { ADMIN_MSG, adminApiErrorMessage } from '../../core/admin-messages';
import type { AdminPaginated } from '../../core/admin-paginated';
import { apiUrl } from '../../core/api-url';
import { AdminAuthService } from '../../core/admin-auth.service';
import { requireWriteAccess } from '../../core/admin-write-access';
import { AdminNoticeService } from '../../shared/admin-notice/admin-notice.service';
import { AdminPaginationBarComponent } from '../../shared/admin-pagination-bar/admin-pagination-bar.component';
import { HelpPanelComponent } from '../../shared/help-panel/help-panel.component';
import { AdminDateTimePipe } from '../../shared/pipes/admin-datetime.pipe';

type SiteContentRow = { key: string; updatedAt: string };

@Component({
  selector: 'app-site-content-list',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, AdminDateTimePipe, HelpPanelComponent, AdminPaginationBarComponent],
  template: `
    <h1 class="page-title">Site content</h1>
    <p class="page-intro">
      Edit the public home page text and sections. Open <strong>Home page</strong> below to change hero copy, about blocks, and testimonials headings.
    </p>

    <p *ngIf="!listLoaded" class="loading-msg">Loading content sections…</p>

    <section *ngIf="listLoaded && !hasHome" class="home-missing-card">
      <h2>Home page not set up yet</h2>
      <p *ngIf="auth.canWrite()">
        Create the default home page content so you can edit it here. This does not change catalog data (cities, tours, projects).
      </p>
      <p *ngIf="auth.isReadOnly()">
        An admin account must create the home page content first. After that you can view it here.
      </p>
      <button
        *ngIf="auth.canWrite()"
        type="button"
        class="btn btn-primary"
        [disabled]="initializing"
        (click)="createHomeContent()"
      >
        {{ initializing ? 'Creating…' : 'Create home page content' }}
      </button>
    </section>

    <div class="admin-table-wrap-cards" *ngIf="listLoaded && rows.length > 0">
      <div class="admin-scroll">
        <table class="admin-table">
          <thead>
            <tr>
              <th scope="col">Page / section</th>
              <th scope="col">Last updated</th>
              <th scope="col" class="admin-col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of rows">
              <td>{{ labelForKey(row.key) }}</td>
              <td>{{ row.updatedAt | adminDateTime }}</td>
              <td class="admin-col-actions">
                <a class="btn btn-small btn-view" [routerLink]="['/cms/site-content', row.key]">
                  {{ actionLabel(row.key) }}
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="admin-cards">
        <div class="admin-card" *ngFor="let row of rows">
          <strong>{{ labelForKey(row.key) }}</strong>
          <div class="muted">{{ row.updatedAt | adminDateTime }}</div>
          <a class="btn btn-small btn-view" [routerLink]="['/cms/site-content', row.key]">
            {{ actionLabel(row.key) }}
          </a>
        </div>
      </div>
    </div>

    <p *ngIf="listLoaded && rows.length === 0 && hasHome" class="admin-empty-state">No other content sections.</p>

    <app-admin-pagination-bar
      *ngIf="listLoaded && total > pageSize"
      itemLabel="sections"
      [page]="page"
      [pageSize]="pageSize"
      [total]="total"
      (pageChange)="onPage($event)"
    />
  `,
  styles: [
    `
      .loading-msg {
        color: var(--admin-muted);
      }
      .home-missing-card {
        margin: 0 0 1.25rem;
        padding: 1rem 1.1rem;
        border-radius: 10px;
        border: 1px solid var(--admin-border);
        background: rgba(15, 23, 42, 0.55);
      }
      .home-missing-card h2 {
        margin: 0 0 0.5rem;
        font-size: 1.05rem;
      }
      .home-missing-card p {
        margin: 0 0 0.75rem;
        color: var(--admin-muted);
        font-size: 0.92rem;
        line-height: 1.45;
      }
      .muted {
        color: var(--admin-muted);
        font-size: 0.85rem;
      }
      a.btn-small.btn-view {
        display: inline-flex;
        text-decoration: none;
      }
    `,
  ],
})
export class SiteContentListComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly auth = inject(AdminAuthService);
  private readonly notice = inject(AdminNoticeService);

  readonly pageSize = 20;
  page = 1;
  total = 0;
  rows: SiteContentRow[] = [];
  listLoaded = false;
  initializing = false;

  get hasHome(): boolean {
    return this.rows.some((r) => r.key === 'home');
  }

  ngOnInit(): void {
    this.reload();
  }

  labelForKey(key: string): string {
    if (key === 'home') {
      return 'Home page';
    }
    return key;
  }

  actionLabel(key: string): string {
    if (key === 'home') {
      return this.auth.canWrite() ? 'Edit home page' : 'View home page';
    }
    return this.auth.canWrite() ? 'Open editor' : 'View';
  }

  onPage(p: number): void {
    this.page = p;
    this.reload();
  }

  createHomeContent(): void {
    if (!requireWriteAccess(this.auth, this.notice)) {
      return;
    }
    this.initializing = true;
    const bundled = migrateRawHomeToBundled(HOME_PAGE_DEFAULTS);
    const payload = bundledHomeToStorageV2(bundled);
    this.http.put(apiUrl('/api/admin/site-content/home'), { payload }).subscribe({
      next: () => {
        this.initializing = false;
        this.notice.success('Home page content created. You can edit it now.');
        this.reload();
      },
      error: (e) => {
        this.initializing = false;
        this.notice.error(adminApiErrorMessage(e, ADMIN_MSG.save));
      },
    });
  }

  reload(): void {
    this.listLoaded = false;
    this.http
      .get<AdminPaginated<SiteContentRow>>(apiUrl('/api/admin/site-content'), {
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
}
