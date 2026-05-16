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
import { AdminDateTimePipe } from '../../shared/pipes/admin-datetime.pipe';

type Contact = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  subject: string;
  message?: string;
  createdAt: string;
};

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [NgFor, NgIf, SlicePipe, AdminDateTimePipe, HelpPanelComponent, AdminModalComponent, AdminPaginationBarComponent],
  template: `
    <h1 class="page-title">Contact inquiries</h1>
    <p class="page-intro">
      Messages sent through the website contact form. Reply using the phone or email shown — this panel does not send replies.
    </p>
    <app-help-panel title="Read-only">These rows are a log only; they are not editable here.</app-help-panel>
    <p *ngIf="listLoaded && rows.length === 0" class="admin-empty-state">No messages yet.</p>
    <div class="admin-table-wrap-cards" *ngIf="listLoaded && rows.length > 0">
      <div class="admin-scroll">
        <table class="admin-table">
          <thead>
            <tr>
              <th scope="col">Received</th>
              <th scope="col">Name</th>
              <th scope="col">Subject</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of rows" [class.active]="detail?.id === row.id">
              <td>{{ row.createdAt | adminDateTime }}</td>
              <td>{{ row.fullName }}</td>
              <td>{{ row.subject }}</td>
              <td><button type="button" class="btn" (click)="openDetail(row.id)">View message</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="admin-cards">
        <div class="admin-card" *ngFor="let row of rows">
          <strong>{{ row.fullName }}</strong>
          <div>{{ row.subject }}</div>
          <button type="button" class="btn" (click)="openDetail(row.id)">View message</button>
        </div>
      </div>
    </div>
    <app-admin-pagination-bar
      itemLabel="messages"
      [page]="page"
      [pageSize]="pageSize"
      [total]="total"
      (pageChange)="onPage($event)"
    />

    <app-admin-modal [(open)]="detailModalOpen" title="Contact message">
      <div class="detail-body" *ngIf="detail as d">
        <dl class="detail-grid">
          <dt>Name</dt>
          <dd>{{ d.fullName }}</dd>
          <dt>Phone</dt>
          <dd>{{ d.phone }}</dd>
          <dt>Email</dt>
          <dd>{{ d.email || '—' }}</dd>
          <dt>Subject</dt>
          <dd>{{ d.subject }}</dd>
          <dt>Message</dt>
          <dd class="multiline">{{ d.message }}</dd>
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
export class ContactsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly notice = inject(AdminNoticeService);

  readonly pageSize = 20;
  page = 1;
  total = 0;
  listLoaded = false;
  rows: Contact[] = [];
  detail: Contact | null = null;
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
      .get<AdminPaginated<Contact>>(apiUrl('/api/admin/contact-inquiries'), {
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
    this.http.get<Contact>(apiUrl(`/api/admin/contact-inquiries/${id}`)).subscribe({
      next: (c) => {
        this.detail = c;
        this.detailModalOpen = true;
      },
      error: () => {
        this.error = 'Could not open this message. Try again.';
      },
    });
  }
}
