import { NgFor, NgIf, SlicePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ADMIN_MSG, adminApiErrorMessage } from '../../core/admin-messages';
import type { AdminPaginated } from '../../core/admin-paginated';
import { apiUrl } from '../../core/api-url';
import { AdminAuthService } from '../../core/admin-auth.service';
import { requireWriteAccess } from '../../core/admin-write-access';
import { AdminConfirmService } from '../../shared/admin-confirm/admin-confirm.service';
import { AdminModalComponent } from '../../shared/admin-modal/admin-modal.component';
import { AdminNoticeService } from '../../shared/admin-notice/admin-notice.service';
import { AdminPaginationBarComponent } from '../../shared/admin-pagination-bar/admin-pagination-bar.component';
import { HelpPanelComponent } from '../../shared/help-panel/help-panel.component';
import { AdminDateTimePipe } from '../../shared/pipes/admin-datetime.pipe';

type ReviewRow = {
  id: string;
  status: string;
  targetType: string;
  targetSlug: string | null;
  name: string;
  rating: number;
  text: string;
  role: string | null;
  createdAt: string;
};

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [
    FormsModule,
    NgFor,
    NgIf,
    SlicePipe,
    AdminDateTimePipe,
    HelpPanelComponent,
    AdminPaginationBarComponent,
    AdminModalComponent,
  ],
  template: `
    <h1 class="page-title">Reviews</h1>
    <p class="page-intro">
      Visitors submit reviews from the home page. <strong>Approve</strong> a review to show it in the public carousel;
      <strong>Reject</strong> or leave <strong>Pending</strong> to keep it hidden. This is the only place to manage home-page quotes.
    </p>
    <app-help-panel title="Statuses">
      <strong>Pending</strong> — new submission, not on the site.
      <strong>Approved</strong> — visible on the home page (for <code>app</code> targets).
      <strong>Rejected</strong> — hidden from the site.
    </app-help-panel>
    <div class="toolbar">
      <label
        >Show
        <select [(ngModel)]="filter" (ngModelChange)="onFilterChange($event)">
          <option value="pending">Pending only</option>
          <option value="">All reviews</option>
          <option value="approved">Approved only</option>
          <option value="rejected">Rejected only</option>
        </select>
      </label>
    </div>
    <div class="admin-table-wrap-cards">
      <div class="admin-scroll">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Submitted</th>
              <th>Guest</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Message</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of rows">
              <td>{{ row.createdAt | adminDateTime }}</td>
              <td>
                {{ row.name }}
                <span class="muted" *ngIf="row.role"> · {{ row.role }}</span>
              </td>
              <td>{{ row.rating }}/5</td>
              <td>
                <select
                  *ngIf="auth.canWrite()"
                  [ngModel]="row.status"
                  (ngModelChange)="onStatusChange(row, $event)"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <span *ngIf="!auth.canWrite()">{{ row.status }}</span>
              </td>
              <td class="clip">{{ row.text }}</td>
              <td>
                <button type="button" class="btn btn-sm btn-view" (click)="openDetail(row)">Read</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="admin-cards">
        <div class="admin-card" *ngFor="let row of rows">
          <strong>{{ row.name }}</strong> · {{ row.rating }}/5 · {{ row.status }}
          <p>{{ row.text | slice: 0 : 160 }}<ng-container *ngIf="row.text.length > 160">…</ng-container></p>
          <div class="card-actions">
            <button type="button" class="btn btn-sm btn-view" (click)="openDetail(row)">Read full</button>
            <select
              *ngIf="auth.canWrite()"
              [ngModel]="row.status"
              (ngModelChange)="onStatusChange(row, $event)"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <span *ngIf="!auth.canWrite()" class="muted">{{ row.status }}</span>
          </div>
        </div>
      </div>
    </div>
    <app-admin-pagination-bar
      itemLabel="reviews"
      [page]="page"
      [pageSize]="pageSize"
      [total]="total"
      (pageChange)="onPage($event)"
    />
    <p class="err" *ngIf="error">{{ error }}</p>

    <app-admin-modal [(open)]="detailOpen" [title]="detailRow ? 'Review from ' + detailRow.name : 'Review'">
      <ng-container *ngIf="detailRow">
        <p class="detail-meta">
          {{ detailRow.rating }}/5 · {{ detailRow.status }} · {{ detailRow.createdAt | adminDateTime }}
          <span *ngIf="detailRow.role"> · {{ detailRow.role }}</span>
        </p>
        <p class="detail-text">{{ detailRow.text }}</p>
      </ng-container>
    </app-admin-modal>
  `,
  styles: [
    `
      .toolbar {
        margin-bottom: 0.75rem;
      }
      select {
        margin-left: 0.35rem;
        padding: 0.35rem;
        border-radius: 6px;
        border: 1px solid var(--admin-border);
        background: #020617;
        color: var(--admin-text);
      }
      .clip {
        max-width: 280px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .muted {
        color: var(--admin-muted);
        font-size: 0.85rem;
      }
      .btn-sm {
        padding: 0.25rem 0.55rem;
        font-size: 0.8rem;
      }
      .card-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
        margin-top: 0.5rem;
      }
      .detail-meta {
        color: var(--admin-muted);
        font-size: 0.9rem;
        margin: 0 0 0.75rem;
      }
      .detail-text {
        white-space: pre-wrap;
        line-height: 1.5;
        margin: 0;
      }
      .err {
        color: var(--admin-danger);
      }
    `,
  ],
})
export class ReviewsComponent implements OnInit {
  readonly auth = inject(AdminAuthService);
  private readonly http = inject(HttpClient);
  private readonly confirm = inject(AdminConfirmService);
  private readonly notice = inject(AdminNoticeService);

  readonly pageSize = 20;
  page = 1;
  total = 0;
  rows: ReviewRow[] = [];
  /** Default to pending so new submissions are easy to find. */
  filter = 'pending';
  error = '';
  detailOpen = false;
  detailRow: ReviewRow | null = null;

  ngOnInit(): void {
    this.reload();
  }

  onPage(p: number): void {
    this.page = p;
    this.reload();
  }

  onFilterChange(_value: string): void {
    this.page = 1;
    this.reload();
  }

  openDetail(row: ReviewRow): void {
    this.detailRow = row;
    this.detailOpen = true;
  }

  reload(): void {
    let params = new HttpParams().set('page', String(this.page)).set('pageSize', String(this.pageSize));
    if (this.filter) {
      params = params.set('status', this.filter);
    }
    this.http.get<AdminPaginated<ReviewRow>>(apiUrl('/api/admin/reviews'), { params }).subscribe({
      next: (r) => {
        this.rows = r.items;
        this.total = r.total;
        if (r.items.length === 0 && r.total > 0 && this.page > 1) {
          this.page--;
          this.reload();
        }
      },
      error: () => {
        this.notice.error(ADMIN_MSG.loadList);
      },
    });
  }

  onStatusChange(row: ReviewRow, status: string): void {
    void this.patchAsync(row, status);
  }

  private async patchAsync(row: ReviewRow, status: string): Promise<void> {
    if (!requireWriteAccess(this.auth, this.notice)) {
      return;
    }
    if (status === row.status) {
      return;
    }
    const label =
      status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Pending';
    const ok = await this.confirm.open({
      title: 'Change review status?',
      message: `Set the review from ${row.name} to “${label}”?`,
      confirmLabel: 'Yes, update',
    });
    if (!ok) {
      this.reload();
      return;
    }
    this.error = '';
    this.http.patch(apiUrl(`/api/admin/reviews/${row.id}`), { status }).subscribe({
      next: () => {
        this.notice.success('Review status updated.');
        this.reload();
      },
      error: (e) => {
        this.notice.error(adminApiErrorMessage(e, ADMIN_MSG.save));
        this.reload();
      },
    });
  }
}
