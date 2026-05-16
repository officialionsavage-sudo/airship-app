import { NgFor, NgIf } from '@angular/common';
import { Component, Input, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { adminApiErrorMessage } from '../../core/admin-messages';
import { resolveAdminImagePreviewSrc } from '../../core/admin-image-preview';
import { AdminMediaUploadService } from '../../core/admin-media-upload.service';
import { ADMIN_IMAGE_MAX_BYTES } from '../admin-image-field/admin-image-field.component';
import { AdminFieldHintComponent } from '../admin-field-hint/admin-field-hint.component';

/**
 * Binds to a JSON string representing string[] (e.g. project.images). Each slot is a media URL on your API.
 */
@Component({
  selector: 'app-admin-image-json-array',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, AdminFieldHintComponent],
  template: `
    <div class="admin-gallery">
      <span class="lbl-row">
        <span class="lbl">{{ label }}</span>
        <app-admin-field-hint *ngIf="fieldHint" [text]="fieldHint" />
      </span>
      <p class="hint">One image per slot (max {{ maxKb }} KB each). Uploaded to your API server.</p>

      <input
        type="file"
        class="sr-only"
        accept="image/*"
        [disabled]="disabled || uploading"
        #replaceOrAddInput
        (change)="onFilePicked($event, replaceOrAddInput)"
      />

      <div class="slots">
        <div class="slot" *ngFor="let img of images; let i = index">
          <div class="slot-prev" *ngIf="previewFor(img); else noPrev">
            <img [src]="previewFor(img)!" alt="" class="thumb" />
          </div>
          <ng-template #noPrev>
            <div class="slot-prev placeholder">No preview</div>
          </ng-template>
          <div class="slot-actions">
            <button
              type="button"
              class="btn btn-small"
              [disabled]="disabled || uploading"
              (click)="pendingOp = { kind: 'replace', index: i }; replaceOrAddInput.click()"
            >
              Replace
            </button>
            <button type="button" class="btn btn-small danger" [disabled]="disabled || uploading" (click)="remove(i)">
              Remove
            </button>
          </div>
        </div>
      </div>

      <div class="row-add">
        <button
          type="button"
          class="btn btn-small"
          [disabled]="disabled || uploading"
          (click)="pendingOp = { kind: 'add' }; replaceOrAddInput.click()"
        >
          {{ uploading ? 'Uploading…' : 'Add image' }}
        </button>
      </div>

      <p class="err" *ngIf="fileError">{{ fileError }}</p>
    </div>
  `,
  styles: [
    `
      .admin-gallery {
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
      .slots {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
      }
      .slot {
        display: grid;
        grid-template-columns: 120px 1fr;
        gap: 0.55rem;
        align-items: start;
        padding: 0.5rem 0;
        border-bottom: 1px dashed var(--admin-border);
      }
      .slot:last-of-type {
        border-bottom: none;
      }
      .thumb {
        width: 120px;
        height: 80px;
        object-fit: contain;
        border-radius: 8px;
        border: 1px solid var(--admin-border);
        background: #0f172a;
      }
      .placeholder {
        width: 120px;
        height: 80px;
        border-radius: 8px;
        border: 1px dashed var(--admin-border);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.65rem;
        color: var(--admin-muted);
      }
      .slot-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
      }
      .btn-small {
        font-size: 0.75rem;
        padding: 0.35rem 0.65rem;
      }
      .danger {
        border-color: var(--admin-danger);
        color: var(--admin-danger);
        background: transparent;
      }
      .row-add {
        margin: 0.35rem 0;
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
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AdminImageJsonArrayComponent),
      multi: true,
    },
  ],
})
export class AdminImageJsonArrayComponent implements ControlValueAccessor {
  private readonly uploads = inject(AdminMediaUploadService);

  @Input() label = 'Images';
  @Input() fieldHint = '';
  @Input() maxBytes = ADMIN_IMAGE_MAX_BYTES;
  @Input() uploadScope = 'catalog';

  images: string[] = [];
  rawJson = '[]';
  fileError = '';
  uploading = false;

  protected disabled = false;

  pendingOp: { kind: 'add' } | { kind: 'replace'; index: number } | null = null;

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  get maxKb(): number {
    return Math.round(this.maxBytes / 1024);
  }

  previewFor(v: string): string | null {
    const src = resolveAdminImagePreviewSrc(String(v ?? ''));
    return src || null;
  }

  writeValue(json: string | null): void {
    try {
      const parsed = JSON.parse(json ?? '[]');
      this.images = Array.isArray(parsed) ? parsed.map((x) => String(x)) : [];
    } catch {
      this.images = [];
    }
    this.syncRawJson();
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

  private syncRawJson(): void {
    this.rawJson = JSON.stringify(this.images, null, 2);
  }

  private propagate(): void {
    this.syncRawJson();
    this.onChange(this.rawJson);
    this.onTouched();
  }

  onFilePicked(ev: Event, input: HTMLInputElement): void {
    const op = this.pendingOp;
    this.pendingOp = null;
    const file = (ev.target as HTMLInputElement).files?.[0];
    input.value = '';
    if (!op || !file) {
      return;
    }
    this.ingestFile(file, (url) => {
      if (op.kind === 'add') {
        this.images = [...this.images, url];
      } else {
        const next = [...this.images];
        next[op.index] = url;
        this.images = next;
      }
      this.propagate();
    });
  }

  remove(index: number): void {
    this.images = this.images.filter((_, i) => i !== index);
    this.propagate();
  }

  private ingestFile(file: File, done: (url: string) => void): void {
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
        done(res.url);
      },
      error: (err: unknown) => {
        this.uploading = false;
        this.fileError = adminApiErrorMessage(err, 'Upload failed. Try again.');
      },
    });
  }
}
