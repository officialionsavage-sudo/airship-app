import { NgFor, NgIf, SlicePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ADMIN_MSG, adminApiErrorMessage } from '../../core/admin-messages';
import type { AdminPaginated } from '../../core/admin-paginated';
import { apiUrl } from '../../core/api-url';
import { AdminConfirmService } from '../../shared/admin-confirm/admin-confirm.service';
import { AdminNoticeService } from '../../shared/admin-notice/admin-notice.service';
import { AdminModalComponent } from '../../shared/admin-modal/admin-modal.component';
import { AdminPaginationBarComponent } from '../../shared/admin-pagination-bar/admin-pagination-bar.component';
import { AdminFieldHintComponent } from '../../shared/admin-field-hint/admin-field-hint.component';
import { SITE_SETTING_HINTS } from '../../shared/admin-field-hint/admin-field-hints.constants';
import { HelpPanelComponent } from '../../shared/help-panel/help-panel.component';
import { AdminDateTimePipe } from '../../shared/pipes/admin-datetime.pipe';

type Row = { key: string; value: string; updatedAt: string };

@Component({
  selector: 'app-site-settings',
  standalone: true,
  imports: [
    FormsModule,
    NgFor,
    NgIf,
    SlicePipe,
    AdminDateTimePipe,
    HelpPanelComponent,
    AdminModalComponent,
    AdminPaginationBarComponent,
    AdminFieldHintComponent,
  ],
  template: `
    <h1 class="page-title">Site settings</h1>
    <p class="page-intro">
      Phone number, WhatsApp, email, address, and opening hours used on the contact page and footer. Change the value in the box and click <strong>Save</strong> on that row.
    </p>
    <app-help-panel title="Built-in setting names">
      Your developer may have added entries such as <code>contact_phone</code>, <code>contact_whatsapp</code>, <code>contact_email</code>, <code>contact_location</code>, and
      <code>contact_hours_line_1</code> … <code>contact_hours_line_3</code>. Only add new rows if they gave you a specific name to use.
    </app-help-panel>
    <div class="admin-toolbar">
      <button type="button" class="btn btn-primary" (click)="openCreateModal()">Add advanced setting</button>
    </div>
    <p *ngIf="listLoaded && rows.length === 0" class="admin-empty-state">No settings returned — check your connection or ask support.</p>
    <div class="admin-table-wrap-cards" *ngIf="listLoaded && rows.length > 0">
      <div class="admin-scroll">
        <table class="admin-table">
          <thead>
            <tr>
              <th>
                <span class="th-hint">
                  Setting name
                  <app-admin-field-hint [text]="ssHint.key" />
                </span>
              </th>
              <th>
                <span class="th-hint">
                  Value
                  <app-admin-field-hint [text]="ssHint.value" />
                </span>
              </th>
              <th>Last updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of rows">
              <td>
                <code>{{ row.key }}</code>
              </td>
              <td><input [(ngModel)]="row.value" [name]="'v-' + row.key" /></td>
              <td class="muted">{{ row.updatedAt | adminDateTime }}</td>
              <td>
                <button type="button" class="btn btn-primary" (click)="saveRow(row)">Save row</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="admin-cards">
        <div class="admin-card" *ngFor="let row of rows">
          <strong>{{ row.key }}</strong>
          <input [(ngModel)]="row.value" />
          <button type="button" class="btn btn-primary" (click)="saveRow(row)">Save row</button>
        </div>
      </div>
    </div>
    <app-admin-pagination-bar
      itemLabel="settings"
      [page]="page"
      [pageSize]="pageSize"
      [total]="total"
      (pageChange)="onPage($event)"
    />

    <app-admin-modal [(open)]="createModalOpen" title="Add a setting">
      <div class="modal-scroll-form">
        <div class="field">
          <label class="field-label-with-hint">
            Key
            <app-admin-field-hint [text]="ssHint.key" />
          </label>
          <input [(ngModel)]="newKey" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Value
            <app-admin-field-hint [text]="ssHint.value" />
          </label>
          <input [(ngModel)]="newValue" />
        </div>
        <div class="admin-modal-actions">
          <button type="button" class="btn btn-primary" (click)="create()">Save new setting</button>
          <button type="button" class="btn" (click)="createModalOpen = false">Close</button>
        </div>
        <p class="err" *ngIf="error">{{ error }}</p>
      </div>
    </app-admin-modal>
  `,
  styles: [
    `
      td input {
        width: 100%;
        min-width: 200px;
        padding: 0.35rem 0.45rem;
        border-radius: 6px;
        border: 1px solid var(--admin-border);
        background: #020617;
        color: var(--admin-text);
      }
      .muted {
        color: var(--admin-muted);
        font-size: 0.8rem;
      }
      .err {
        color: var(--admin-danger);
      }
      .th-hint {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
      }
    `,
  ],
})
export class SiteSettingsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly confirm = inject(AdminConfirmService);
  private readonly notice = inject(AdminNoticeService);

  readonly ssHint = SITE_SETTING_HINTS;
  readonly pageSize = 20;
  page = 1;
  total = 0;
  rows: Row[] = [];
  listLoaded = false;
  newKey = '';
  newValue = '';
  error = '';
  createModalOpen = false;

  ngOnInit(): void {
    this.reload();
  }

  onPage(p: number): void {
    this.page = p;
    this.reload();
  }

  reload(): void {
    this.http
      .get<AdminPaginated<Row>>(apiUrl('/api/admin/site-settings'), {
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

  openCreateModal(): void {
    this.newKey = '';
    this.newValue = '';
    this.error = '';
    this.createModalOpen = true;
  }

  saveRow(row: Row): void {
    void this.saveRowAsync(row);
  }

  private async saveRowAsync(row: Row): Promise<void> {
    const ok = await this.confirm.open({
      title: 'Save this setting?',
      message: `Update “${row.key}” on the live website?`,
      confirmLabel: 'Save',
    });
    if (!ok) {
      return;
    }
    this.error = '';
    this.http.put(apiUrl(`/api/admin/site-settings/${encodeURIComponent(row.key)}`), { value: row.value }).subscribe({
      next: () => {
        this.notice.success(`Saved “${row.key}”.`);
        this.reload();
      },
      error: (e) => {
        this.notice.error(adminApiErrorMessage(e, ADMIN_MSG.save));
      },
    });
  }

  create(): void {
    void this.createAsync();
  }

  private async createAsync(): Promise<void> {
    const k = this.newKey.trim();
    if (!k) {
      this.error = 'Please enter a setting name (your developer will tell you which name to use).';
      return;
    }
    const ok = await this.confirm.open({
      title: 'Add this setting?',
      message: `Create “${k}” with the value you entered?`,
      confirmLabel: 'Create',
    });
    if (!ok) {
      return;
    }
    this.error = '';
    this.http.put(apiUrl(`/api/admin/site-settings/${encodeURIComponent(k)}`), { value: this.newValue }).subscribe({
      next: () => {
        this.createModalOpen = false;
        this.newKey = '';
        this.newValue = '';
        this.notice.success('Setting added.');
        this.reload();
      },
      error: (e) => {
        this.error = adminApiErrorMessage(e, ADMIN_MSG.save);
      },
    });
  }
}
