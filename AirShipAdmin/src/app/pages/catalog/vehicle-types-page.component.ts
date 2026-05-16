import { NgFor, NgIf } from '@angular/common';
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
import { VEHICLE_TYPE_HINTS } from '../../shared/admin-field-hint/admin-field-hints.constants';
import { HelpPanelComponent } from '../../shared/help-panel/help-panel.component';

type VehicleTypeRow = { id: string; label: string; sortOrder: number };

@Component({
  selector: 'app-vehicle-types-page',
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
    <h1 class="page-title">Vehicle types</h1>
    <p class="page-intro">
      Labels shown in the public Transfer page airport form (“Vehicle type” dropdown). Order with sort numbers — lower appears first.
    </p>
    <app-help-panel title="Tip">
      Keep names short (e.g. Sedan, SUV). They are not tied to the car fleet categories — only used for guest requests.
    </app-help-panel>
    <div class="admin-toolbar">
      <button type="button" class="btn btn-primary" (click)="openNew()">Add type</button>
    </div>
    <p *ngIf="listLoaded && rows.length === 0" class="admin-empty-state">No vehicle types yet.</p>
    <div class="admin-table-wrap-cards" *ngIf="listLoaded && rows.length > 0">
      <div class="admin-scroll">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Label</th>
              <th>Sort</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of rows">
              <td>{{ r.label }}</td>
              <td>{{ r.sortOrder }}</td>
              <td><button type="button" class="btn" (click)="pick(r)">Edit</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <app-admin-pagination-bar
      itemLabel="types"
      [page]="page"
      [pageSize]="pageSize"
      [total]="total"
      (pageChange)="onPage($event)"
    />

    <app-admin-modal [(open)]="modalOpen" [title]="picked ? 'Edit vehicle type' : 'Add vehicle type'">
      <div class="modal-scroll-form">
        <div class="field">
          <label class="field-label-with-hint">
            Label
            <app-admin-field-hint [text]="hint.label" />
          </label>
          <input [(ngModel)]="f.label" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Sort order
            <app-admin-field-hint [text]="hint.sortOrder" />
          </label>
          <input type="number" [(ngModel)]="f.sortOrder" />
        </div>
        <p class="err" *ngIf="error">{{ error }}</p>
        <div class="admin-modal-actions">
          <button type="button" class="btn btn-primary" (click)="save()">{{ picked ? 'Save' : 'Create' }}</button>
          <button type="button" class="btn" (click)="modalOpen = false">Close</button>
          <button type="button" class="btn btn-danger" *ngIf="picked" (click)="remove()">Delete</button>
        </div>
      </div>
    </app-admin-modal>
  `,
  styles: [
    `
      .err {
        color: var(--admin-danger);
      }
    `,
  ],
})
export class VehicleTypesPageComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly confirm = inject(AdminConfirmService);
  private readonly notice = inject(AdminNoticeService);

  readonly hint = VEHICLE_TYPE_HINTS;
  readonly pageSize = 50;
  page = 1;
  total = 0;
  listLoaded = false;
  rows: VehicleTypeRow[] = [];
  picked: VehicleTypeRow | null = null;
  f = { label: '', sortOrder: 0 };
  error = '';
  modalOpen = false;

  ngOnInit(): void {
    this.reload();
  }

  onPage(p: number): void {
    this.page = p;
    this.reload();
  }

  reload(): void {
    this.http
      .get<AdminPaginated<VehicleTypeRow>>(apiUrl('/api/admin/vehicle-types'), {
        params: { page: this.page, pageSize: this.pageSize },
      })
      .subscribe({
        next: (r) => {
          this.listLoaded = true;
          this.rows = r.items;
          this.total = r.total;
        },
        error: () => {
          this.listLoaded = true;
          this.notice.error(ADMIN_MSG.loadList);
        },
      });
  }

  openNew(): void {
    this.picked = null;
    this.f = { label: '', sortOrder: 0 };
    this.error = '';
    this.modalOpen = true;
  }

  pick(r: VehicleTypeRow): void {
    this.picked = r;
    this.f = { label: r.label, sortOrder: r.sortOrder };
    this.error = '';
    this.modalOpen = true;
  }

  save(): void {
    void this.saveAsync();
  }

  private async saveAsync(): Promise<void> {
    if (!this.f.label.trim()) {
      this.error = 'Label is required.';
      return;
    }
    const ok = await this.confirm.open({
      title: this.picked ? 'Save?' : 'Create?',
      message: this.picked ? 'Updates apply to the public dropdown.' : 'Adds a new option for guests.',
      confirmLabel: this.picked ? 'Save' : 'Create',
    });
    if (!ok) return;
    const body = { label: this.f.label.trim(), sortOrder: Number(this.f.sortOrder) };
    this.error = '';
    const req = this.picked
      ? this.http.put(apiUrl(`/api/admin/vehicle-types/${this.picked.id}`), body)
      : this.http.post(apiUrl('/api/admin/vehicle-types'), body);
    req.subscribe({
      next: () => {
        this.modalOpen = false;
        this.picked = null;
        this.notice.success('Saved.');
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
    if (!this.picked) return;
    const ok = await this.confirm.open({
      title: 'Delete this type?',
      message: 'It disappears from the public dropdown. Existing inquiries are not changed.',
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    this.http.delete(apiUrl(`/api/admin/vehicle-types/${this.picked.id}`)).subscribe({
      next: () => {
        this.modalOpen = false;
        this.picked = null;
        this.notice.success('Removed.');
        this.reload();
      },
      error: (e) => {
        this.error = adminApiErrorMessage(e, ADMIN_MSG.delete);
      },
    });
  }
}
