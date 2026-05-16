import { NgFor, NgIf, SlicePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { ADMIN_MSG } from '../../core/admin-messages';
import type { AdminPaginated } from '../../core/admin-paginated';
import { apiUrl } from '../../core/api-url';
import { AdminModalComponent } from '../../shared/admin-modal/admin-modal.component';
import { AdminNoticeService } from '../../shared/admin-notice/admin-notice.service';
import { AdminPaginationBarComponent } from '../../shared/admin-pagination-bar/admin-pagination-bar.component';
import { HelpPanelComponent } from '../../shared/help-panel/help-panel.component';
import { AdminDatePipe, AdminDateTimePipe } from '../../shared/pipes/admin-datetime.pipe';

type Booking = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  citySlug: string;
  relatedSlug: string;
  bookingType: string;
  checkIn: string | null;
  checkOut: string | null;
  guests: number | null;
  notes?: string | null;
  createdAt: string;
};

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    SlicePipe,
    AdminDatePipe,
    AdminDateTimePipe,
    HelpPanelComponent,
    AdminModalComponent,
    AdminPaginationBarComponent,
  ],
  template: `
    <h1 class="page-title">Booking inquiries</h1>
    <p class="page-intro">
      Requests sent from tour or unit booking forms on the website. Use this list to follow up by phone or email — nothing here sends automatic replies.
    </p>
    <app-help-panel title="Read-only">
      You cannot edit these rows here; they are a history log. Export or connect a CRM separately if you need workflows.
    </app-help-panel>
    <p *ngIf="listLoaded && rows.length === 0" class="admin-empty-state">No booking inquiries yet.</p>
    <div class="admin-table-wrap-cards" *ngIf="listLoaded && rows.length > 0">
      <div class="admin-scroll">
        <table class="admin-table">
          <thead>
            <tr>
              <th scope="col">Received</th>
              <th scope="col">Guest</th>
              <th scope="col">Kind</th>
              <th scope="col">Destination</th>
              <th scope="col">Listing</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of rows" [class.active]="detail?.id === row.id">
              <td>{{ row.createdAt | adminDateTime }}</td>
              <td>{{ row.fullName }}</td>
              <td>{{ row.bookingType }}</td>
              <td>{{ row.citySlug }}</td>
              <td><code>{{ row.relatedSlug }}</code></td>
              <td><button type="button" class="btn" (click)="openDetail(row.id)">View details</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="admin-cards">
        <div class="admin-card" *ngFor="let row of rows">
          <strong>{{ row.fullName }}</strong>
          <div>{{ row.bookingType }} · {{ row.citySlug }}</div>
          <button type="button" class="btn" (click)="openDetail(row.id)">View details</button>
        </div>
      </div>
    </div>
    <app-admin-pagination-bar
      itemLabel="inquiries"
      [page]="page"
      [pageSize]="pageSize"
      [total]="total"
      (pageChange)="onPage($event)"
    />

    <app-admin-modal [(open)]="detailModalOpen" title="Booking inquiry">
      <div class="detail-body" *ngIf="detail as d">
        <dl class="detail-grid">
          <dt>Name</dt>
          <dd>{{ d.fullName }}</dd>
          <dt>Phone</dt>
          <dd>{{ d.phone }}</dd>
          <dt>Email</dt>
          <dd>{{ d.email || '—' }}</dd>
          <dt>Type</dt>
          <dd>{{ d.bookingType }}</dd>
          <dt>Destination</dt>
          <dd>{{ d.citySlug }}</dd>
          <dt>Listing</dt>
          <dd><code>{{ d.relatedSlug }}</code></dd>
          <dt>Check-in</dt>
          <dd>{{ d.checkIn | adminDate }}</dd>
          <dt>Check-out</dt>
          <dd>{{ d.checkOut | adminDate }}</dd>
          <dt>Guests</dt>
          <dd>{{ d.guests ?? '—' }}</dd>
          <dt>Notes</dt>
          <dd class="multiline">{{ d.notes || '—' }}</dd>
          <dt>Received</dt>
          <dd>{{ d.createdAt | adminDateTime }}</dd>
        </dl>
      </div>
      <p class="err" *ngIf="error">{{ error }}</p>
      <div class="admin-modal-actions">
        <button type="button" class="btn" (click)="detailModalOpen = false">Close</button>
      </div>
    </app-admin-modal>
  `,
  styles: [
    `
      tr.active td {
        background: rgba(56, 189, 248, 0.1);
      }
      .detail-grid {
        display: grid;
        grid-template-columns: 8rem 1fr;
        gap: 0.35rem 0.75rem;
        margin: 0;
        font-size: 0.88rem;
      }
      .detail-grid dt {
        margin: 0;
        color: var(--admin-muted);
      }
      .detail-grid dd {
        margin: 0;
      }
      .multiline {
        white-space: pre-wrap;
        word-break: break-word;
      }
      .err {
        color: var(--admin-danger);
      }
    `,
  ],
})
export class BookingsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly notice = inject(AdminNoticeService);

  readonly pageSize = 20;
  page = 1;
  total = 0;
  listLoaded = false;
  rows: Booking[] = [];
  detail: Booking | null = null;
  error = '';
  detailModalOpen = false;

  ngOnInit(): void {
    this.reload();
  }

  onPage(p: number): void {
    this.page = p;
    this.reload();
  }

  reload(): void {
    this.http
      .get<AdminPaginated<Booking>>(apiUrl('/api/admin/booking-inquiries'), {
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

  openDetail(id: string): void {
    this.error = '';
    this.http.get<Booking>(apiUrl(`/api/admin/booking-inquiries/${id}`)).subscribe({
      next: (b) => {
        this.detail = b;
        this.detailModalOpen = true;
      },
      error: () => {
        this.error = 'Could not open this inquiry. Try again.';
      },
    });
  }
}
