import { NgFor, NgIf } from '@angular/common';
import { Component, Input, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { adminApiErrorMessage } from '../../core/admin-messages';
import { resolveAdminImagePreviewSrc, truncateAdminImageUrl } from '../../core/admin-image-preview';
import { AdminMediaUploadService } from '../../core/admin-media-upload.service';
import {
  ADMIN_GALLERY_MAX_IMAGES,
  ADMIN_IMAGE_MAX_BYTES,
} from '../admin-image-field/admin-image-field.component';
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
        <span class="count">{{ images.length }} / {{ maxCount }}</span>
        <app-admin-field-hint *ngIf="fieldHint" [text]="fieldHint" />
      </span>
      <p class="hint">
        Up to {{ maxCount }} images (max {{ maxKb }} KB each). Uploaded to your API server.
      </p>

      <input
        type="file"
        class="sr-only"
        accept="image/*"
        [disabled]="disabled || uploading || atMaxCount"
        #replaceOrAddInput
        (change)="onFilePicked($event, replaceOrAddInput)"
      />

      <p class="empty" *ngIf="images.length === 0 && !uploading">No images yet — use Add image.</p>

      <p class="ok" *ngIf="lastUploadSuccess">Image added — save the form to keep changes.</p>

      <div class="slots">
        <div class="slot" *ngFor="let img of images; let i = index">
          <div class="slot-head">Image {{ i + 1 }}</div>
          <div class="slot-prev" *ngIf="previewFor(img); else noPrev">
            <img [src]="previewFor(img)!" alt="" class="thumb" />
          </div>
          <ng-template #noPrev>
            <div class="slot-prev placeholder">Preview unavailable</div>
          </ng-template>
          <div class="slot-meta">
            <p class="url-line">{{ urlLabel(img) }}</p>
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
      </div>

      <div class="row-add">
        <button
          type="button"
          class="btn btn-small"
          [disabled]="disabled || uploading || atMaxCount"
          (click)="startAdd(replaceOrAddInput)"
        >
          {{ uploading ? 'Uploading…' : 'Add image' }}
        </button>
        <span class="cap-hint" *ngIf="atMaxCount">Maximum {{ maxCount }} images reached.</span>
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
      .count {
        font-size: 0.72rem;
        font-weight: 600;
        color: var(--admin-text);
        padding: 0.1rem 0.45rem;
        border-radius: 6px;
        background: rgba(148, 163, 184, 0.12);
      }
      .hint {
        margin: 0.35rem 0 0.5rem;
        font-size: 0.72rem;
        color: var(--admin-muted);
        line-height: 1.35;
      }
      .empty {
        font-size: 0.72rem;
        color: var(--admin-muted);
        margin: 0 0 0.5rem;
      }
      .ok {
        font-size: 0.72rem;
        color: #4ade80;
        margin: 0 0 0.5rem;
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
      .slot-head {
        grid-column: 1 / -1;
        font-size: 0.72rem;
        font-weight: 600;
        color: var(--admin-muted);
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
        text-align: center;
        padding: 0.25rem;
      }
      .slot-meta {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }
      .url-line {
        margin: 0;
        font-size: 0.68rem;
        font-family: ui-monospace, monospace;
        color: var(--admin-muted);
        word-break: break-all;
        line-height: 1.35;
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
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
      }
      .cap-hint {
        font-size: 0.72rem;
        color: var(--admin-muted);
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
  @Input() maxCount = ADMIN_GALLERY_MAX_IMAGES;
  @Input() uploadScope = 'catalog';

  images: string[] = [];
  rawJson = '[]';
  fileError = '';
  uploading = false;
  lastUploadSuccess = false;

  protected disabled = false;

  pendingOp: { kind: 'add' } | { kind: 'replace'; index: number } | null = null;

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  get maxKb(): number {
    return Math.round(this.maxBytes / 1024);
  }

  get atMaxCount(): boolean {
    return this.images.length >= this.maxCount;
  }

  previewFor(v: string): string | null {
    const src = resolveAdminImagePreviewSrc(String(v ?? ''));
    return src || null;
  }

  urlLabel(v: string): string {
    return truncateAdminImageUrl(String(v ?? ''));
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
    this.lastUploadSuccess = false;
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

  startAdd(input: HTMLInputElement): void {
    if (this.atMaxCount) {
      this.fileError = `Maximum ${this.maxCount} images allowed. Remove one to add another.`;
      return;
    }
    this.pendingOp = { kind: 'add' };
    input.click();
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
    if (op.kind === 'add' && this.atMaxCount) {
      this.fileError = `Maximum ${this.maxCount} images allowed.`;
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
      this.lastUploadSuccess = true;
      this.propagate();
    });
  }

  remove(index: number): void {
    this.images = this.images.filter((_, i) => i !== index);
    this.lastUploadSuccess = false;
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
