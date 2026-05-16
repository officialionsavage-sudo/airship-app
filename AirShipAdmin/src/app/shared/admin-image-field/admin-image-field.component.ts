import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { adminApiErrorMessage } from '../../core/admin-messages';
import { resolveAdminImagePreviewSrc } from '../../core/admin-image-preview';
import { AdminMediaUploadService } from '../../core/admin-media-upload.service';
import { AdminFieldHintComponent } from '../admin-field-hint/admin-field-hint.component';

/** Default max upload size for admin image fields (2 MB). */
export const ADMIN_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

@Component({
  selector: 'app-admin-image-field',
  standalone: true,
  imports: [FormsModule, NgIf, AdminFieldHintComponent],
  template: `
    <div class="admin-image-field">
      <span class="lbl-row">
        <span class="lbl">{{ label }}</span>
        <app-admin-field-hint *ngIf="fieldHint" [text]="fieldHint" />
      </span>
      <p class="hint">
        Upload an image (max {{ maxKb }} KB). It is saved on your API server and stored as a URL in the database.
      </p>

      <div class="row-top">
        <button
          type="button"
          class="btn btn-small"
          [disabled]="disabled || uploading"
          (click)="fileInput.click()"
        >
          {{ uploading ? 'Uploading…' : 'Choose image' }}
        </button>
        <button type="button" class="btn btn-small ghost" [disabled]="disabled || !value" (click)="clear()">
          Clear
        </button>
        <button type="button" class="btn btn-small ghost" (click)="toggleManual()">
          {{ showManual ? 'Hide' : 'Paste' }} URL
        </button>
        <input
          #fileInput
          type="file"
          class="sr-only"
          accept="image/*"
          [disabled]="disabled || uploading"
          (change)="onFileSelected($event)"
        />
      </div>

      <p class="err" *ngIf="fileError">{{ fileError }}</p>

      <div class="preview-wrap" *ngIf="previewSrc">
        <img [src]="previewSrc" alt="" class="thumb" />
      </div>

      <div class="manual" *ngIf="showManual">
        <textarea
          [(ngModel)]="manualDraft"
          [disabled]="disabled"
          rows="2"
          placeholder="https://your-api.example.com/media/catalog/…"
          class="manual-ta"
        ></textarea>
        <button type="button" class="btn btn-small" [disabled]="disabled" (click)="applyManual()">Apply URL</button>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-image-field {
        padding: 0.65rem 0.75rem;
        border-radius: 10px;
        border: 1px solid var(--admin-border);
        background: #020617;
        margin-bottom: 0.65rem;
      }
      .lbl-row {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        flex-wrap: wrap;
      }
      .lbl {
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--admin-muted);
      }
      .hint {
        margin: 0.35rem 0 0.5rem;
        font-size: 0.72rem;
        color: var(--admin-muted);
        line-height: 1.35;
      }
      .row-top {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
        align-items: center;
      }
      .btn-small {
        font-size: 0.75rem;
        padding: 0.35rem 0.65rem;
      }
      .ghost {
        background: transparent;
        border: 1px solid var(--admin-border);
        color: var(--admin-text);
      }
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        border: 0;
      }
      .err {
        color: var(--admin-danger);
        font-size: 0.75rem;
        margin: 0.35rem 0 0;
      }
      .preview-wrap {
        margin-top: 0.55rem;
      }
      .thumb {
        max-width: 100%;
        max-height: 140px;
        border-radius: 8px;
        border: 1px solid var(--admin-border);
        object-fit: contain;
        background: #0f172a;
      }
      .manual {
        margin-top: 0.55rem;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }
      .manual-ta {
        width: 100%;
        font-family: ui-monospace, monospace;
        font-size: 0.72rem;
        padding: 0.45rem;
        border-radius: 8px;
        border: 1px solid var(--admin-border);
        background: #0f172a;
        color: var(--admin-text);
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AdminImageFieldComponent),
      multi: true,
    },
  ],
})
export class AdminImageFieldComponent implements ControlValueAccessor {
  private readonly uploads = inject(AdminMediaUploadService);

  @Input() label = 'Image';
  @Input() fieldHint = '';
  @Input() maxBytes = ADMIN_IMAGE_MAX_BYTES;
  /** Subfolder scope on the API (`catalog`, `cms`, …). */
  @Input() uploadScope = 'catalog';

  @Output() imageChange = new EventEmitter<void>();

  value = '';
  manualDraft = '';
  showManual = false;
  fileError = '';
  uploading = false;

  protected disabled = false;

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  get maxKb(): number {
    return Math.round(this.maxBytes / 1024);
  }

  get previewSrc(): string {
    return resolveAdminImagePreviewSrc(this.value);
  }

  writeValue(v: string | null): void {
    this.value = v ?? '';
    this.manualDraft = this.value;
    this.fileError = '';
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggleManual(): void {
    this.showManual = !this.showManual;
    if (this.showManual) {
      this.manualDraft = this.value;
    }
  }

  onFileSelected(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.fileError = 'Choose an image file.';
      return;
    }
    if (file.size > this.maxBytes) {
      this.fileError = `Max ${this.maxKb} KB — this file is ${Math.ceil(file.size / 1024)} KB.`;
      return;
    }
    this.fileError = '';
    this.uploading = true;
    this.uploads.uploadImage(file, this.uploadScope).subscribe({
      next: (res) => {
        this.uploading = false;
        this.value = res.url;
        this.manualDraft = res.url;
        this.onChange(this.value);
        this.onTouched();
        this.imageChange.emit();
      },
      error: (err: unknown) => {
        this.uploading = false;
        this.fileError = adminApiErrorMessage(err, 'Upload failed. Try again.');
      },
    });
  }

  clear(): void {
    this.value = '';
    this.manualDraft = '';
    this.fileError = '';
    this.onChange('');
    this.onTouched();
    this.imageChange.emit();
  }

  applyManual(): void {
    const next = this.manualDraft.trim();
    if (/^data:image\//i.test(next)) {
      this.fileError = 'Paste an https URL from your server, not base64.';
      return;
    }
    this.value = next;
    this.onChange(this.value);
    this.onTouched();
    this.fileError = '';
    this.imageChange.emit();
  }
}
