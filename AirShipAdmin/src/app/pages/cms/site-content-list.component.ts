import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ADMIN_MSG } from '../../core/admin-messages';
import type { AdminPaginated } from '../../core/admin-paginated';
import { apiUrl } from '../../core/api-url';
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
      Each item is a bundle of text or structured content used on the public website. Most editors only need <strong>home</strong> — open it to update the landing page.
    </p>
    <app-help-panel title="Other keys">
      Additional keys may be read-only here; your developer can update them if needed.
    </app-help-panel>
    <p *ngIf="listLoaded && rows.length === 0" class="admin-empty-state">No content keys found.</p>
    <div class="admin-table-wrap-cards" *ngIf="listLoaded && rows.length > 0">
      <div class="admin-scroll">
        <table class="admin-table">
          <thead>
            <tr>
              <th scope="col">Page / section</th>
              <th scope="col">Last updated</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of rows">
              <td>
                <code>{{ row.key }}</code>
              </td>
              <td>{{ row.updatedAt | adminDateTime }}</td>
              <td><a class="btn btn-small" [routerLink]="['/cms/site-content', row.key]">Open editor</a></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="admin-cards">
        <div class="admin-card" *ngFor="let row of rows">
          <strong>{{ row.key }}</strong>
          <div class="muted">{{ row.updatedAt | adminDateTime }}</div>
          <a class="btn btn-small" [routerLink]="['/cms/site-content', row.key]">Open editor</a>
        </div>
      </div>
    </div>
    <app-admin-pagination-bar
      itemLabel="sections"
      [page]="page"
      [pageSize]="pageSize"
      [total]="total"
      (pageChange)="onPage($event)"
    />
  `,
  styles: [
    `
      .muted {
        color: var(--admin-muted);
        font-size: 0.85rem;
      }
      a.btn-small {
        display: inline-flex;
        text-decoration: none;
      }
    `,
  ],
})
export class SiteContentListComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly notice = inject(AdminNoticeService);

  readonly pageSize = 20;
  page = 1;
  total = 0;
  rows: SiteContentRow[] = [];
  listLoaded = false;

  ngOnInit(): void {
    this.reload();
  }

  onPage(p: number): void {
    this.page = p;
    this.reload();
  }

  reload(): void {
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
