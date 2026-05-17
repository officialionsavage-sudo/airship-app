import { NgFor, NgIf } from '@angular/common';
import { Component, Input, forwardRef, inject } from '@angular/core';
import { AdminAuthService } from '../../core/admin-auth.service';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AdminFieldHintComponent } from '../admin-field-hint/admin-field-hint.component';

/** Editable list of strings (features, itinerary steps, etc.). */
@Component({
  selector: 'app-admin-string-list',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, AdminFieldHintComponent],
  template: `
    <div class="wrap">
      <span class="lbl-row">
        <span class="lbl">{{ label }}</span>
        <app-admin-field-hint *ngIf="fieldHint" [text]="fieldHint" />
      </span>
      <div class="row" *ngFor="let _ of lines; let i = index">
        <input
          type="text"
          [(ngModel)]="lines[i]"
          [disabled]="disabled"
          (ngModelChange)="onLineChange()"
        />
        <button
          *ngIf="auth.canWrite()"
          type="button"
          class="btn btn-small danger"
          [disabled]="disabled"
          (click)="remove(i)"
        >
          Remove
        </button>
      </div>
      <button *ngIf="auth.canWrite()" type="button" class="btn btn-small" [disabled]="disabled" (click)="add()">
        Add line
      </button>
    </div>
  `,
  styles: [
    `
      .wrap {
        margin-bottom: 0.65rem;
        padding: 0.65rem 0.75rem;
        border-radius: 10px;
        border: 1px solid var(--admin-border);
        background: #020617;
      }
      .lbl-row {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        flex-wrap: wrap;
        margin-bottom: 0.45rem;
      }
      .lbl {
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--admin-muted);
      }
      .row {
        display: flex;
        gap: 0.45rem;
        align-items: center;
        margin-bottom: 0.4rem;
      }
      .row input {
        flex: 1;
        min-width: 0;
        padding: 0.4rem 0.5rem;
        border-radius: 8px;
        border: 1px solid var(--admin-border);
        background: #0f172a;
        color: var(--admin-text);
      }
      .btn-small {
        font-size: 0.75rem;
        padding: 0.35rem 0.55rem;
      }
      .danger {
        border-color: var(--admin-danger);
        color: var(--admin-danger);
        background: transparent;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AdminStringListComponent),
      multi: true,
    },
  ],
})
export class AdminStringListComponent implements ControlValueAccessor {
  readonly auth = inject(AdminAuthService);
  @Input() label = 'Items';
  @Input() fieldHint = '';

  lines: string[] = [];
  disabled = false;

  private onChange: (v: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string[] | null): void {
    this.lines = Array.isArray(value) ? [...value.map((x) => String(x ?? ''))] : [];
  }

  registerOnChange(fn: (v: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  add(): void {
    this.lines = [...this.lines, ''];
    this.emit();
  }

  remove(i: number): void {
    this.lines = this.lines.filter((_, j) => j !== i);
    this.emit();
  }

  onLineChange(): void {
    this.emit();
  }

  private emit(): void {
    this.onChange([...this.lines]);
    this.onTouched();
  }
}
