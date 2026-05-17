import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ADMIN_MSG, adminApiErrorMessage } from '../../core/admin-messages';
import type { AdminPaginated } from '../../core/admin-paginated';
import { apiUrl } from '../../core/api-url';
import { AdminConfirmService } from '../../shared/admin-confirm/admin-confirm.service';
import { AdminNoticeService } from '../../shared/admin-notice/admin-notice.service';
import { AdminAuthService } from '../../core/admin-auth.service';
import { AdminFieldHintComponent } from '../../shared/admin-field-hint/admin-field-hint.component';
import { CONTACT_SETTING_FIELDS } from './site-contact-settings.fields';

type SettingRow = { key: string; value: string; updatedAt: string };

@Component({
  selector: 'app-site-settings',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, AdminFieldHintComponent],
  template: `
    <h1 class="page-title">Site settings</h1>
    <p class="page-intro">
      Update phone, WhatsApp, email, address, and opening hours shown on the public website (contact page, footer, and WhatsApp buttons).
    </p>

    <p *ngIf="loading" class="loading-msg">Loading contact information…</p>

    <form *ngIf="!loading" class="contact-form" (ngSubmit)="save()">
      <div class="field" *ngFor="let field of fields">
        <label class="field-label-with-hint">
          {{ field.label }}
          <span *ngIf="field.required" class="req" aria-hidden="true">*</span>
          <app-admin-field-hint *ngIf="field.hint" [text]="field.hint" />
        </label>
        <input
          [(ngModel)]="values[field.key]"
          [name]="field.key"
          [type]="field.type ?? 'text'"
          [placeholder]="field.placeholder ?? ''"
          [disabled]="saving"
        />
        <p class="field-err" *ngIf="fieldErrors[field.key]">{{ fieldErrors[field.key] }}</p>
      </div>

      <div class="form-actions" *ngIf="auth.canWrite()">
        <button type="submit" class="btn btn-primary" [disabled]="saving">
          {{ saving ? 'Saving…' : 'Save changes' }}
        </button>
      </div>
      <p *ngIf="auth.isReadOnly()" class="readonly-note">Read-only: contact details cannot be changed with this account.</p>
      <p class="form-err" *ngIf="formError">{{ formError }}</p>
    </form>
  `,
  styles: [
    `
      .loading-msg {
        color: var(--admin-muted);
      }
      .contact-form {
        max-width: 520px;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .field label {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        margin-bottom: 0.35rem;
        font-weight: 500;
      }
      .req {
        color: var(--admin-danger);
      }
      .field input {
        width: 100%;
        padding: 0.45rem 0.55rem;
        border-radius: 6px;
        border: 1px solid var(--admin-border);
        background: #020617;
        color: var(--admin-text);
      }
      .field input:disabled {
        opacity: 0.7;
      }
      .field-err,
      .form-err {
        margin: 0.25rem 0 0;
        color: var(--admin-danger);
        font-size: 0.85rem;
      }
      .form-actions {
        margin-top: 0.5rem;
      }
      .readonly-note {
        margin: 0.5rem 0 0;
        color: var(--admin-muted);
        font-size: 0.9rem;
      }
    `,
  ],
})
export class SiteSettingsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly confirm = inject(AdminConfirmService);
  private readonly notice = inject(AdminNoticeService);
  readonly auth = inject(AdminAuthService);

  readonly fields = CONTACT_SETTING_FIELDS;
  values: Record<string, string> = {};
  fieldErrors: Record<string, string> = {};
  formError = '';
  loading = true;
  saving = false;

  ngOnInit(): void {
    for (const field of this.fields) {
      this.values[field.key] = '';
    }
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.http
      .get<AdminPaginated<SettingRow>>(apiUrl('/api/admin/site-settings'), {
        params: { page: 1, pageSize: 50 },
      })
      .subscribe({
        next: (r) => {
          const map: Record<string, string> = {};
          for (const row of r.items) {
            map[row.key] = row.value;
          }
          for (const field of this.fields) {
            this.values[field.key] = map[field.key]?.trim() ?? '';
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.notice.error(ADMIN_MSG.loadList);
        },
      });
  }

  save(): void {
    void this.saveAsync();
  }

  private async saveAsync(): Promise<void> {
    if (!this.auth.canWrite()) {
      this.notice.error('Read-only account: you cannot change settings.');
      return;
    }
    this.fieldErrors = {};
    this.formError = '';

    let valid = true;
    for (const field of this.fields) {
      if (!field.required) {
        continue;
      }
      const v = (this.values[field.key] ?? '').trim();
      if (!v) {
        this.fieldErrors[field.key] = `${field.label} is required.`;
        valid = false;
      }
    }
    if (!valid) {
      return;
    }

    const ok = await this.confirm.open({
      title: 'Save contact information?',
      message: 'Update phone, WhatsApp, email, address, and hours on the live website?',
      confirmLabel: 'Save',
    });
    if (!ok) {
      return;
    }

    this.saving = true;
    const puts = this.fields.map((field) =>
      this.http.put(apiUrl(`/api/admin/site-settings/${encodeURIComponent(field.key)}`), {
        value: (this.values[field.key] ?? '').trim(),
      }),
    );

    forkJoin(puts).subscribe({
      next: () => {
        this.saving = false;
        this.notice.success('Contact information saved.');
      },
      error: (e) => {
        this.saving = false;
        this.formError = adminApiErrorMessage(e, ADMIN_MSG.save);
      },
    });
  }
}
