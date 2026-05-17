import { NgFor, NgIf } from '@angular/common';
import { Component, Input, forwardRef, inject } from '@angular/core';
import { AdminAuthService } from '../../core/admin-auth.service';
import { AdminFieldHintComponent } from '../admin-field-hint/admin-field-hint.component';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

export type TourPriceRow = { label: string; amount: number; discountPercent: number };

@Component({
  selector: 'app-admin-tour-prices',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, AdminFieldHintComponent],
  template: `
    <div class="wrap">
      <span class="lbl-row">
        <span class="lbl">Price options</span>
        <app-admin-field-hint *ngIf="fieldHint" [text]="fieldHint" />
      </span>
      <p class="hint">One row per ticket tier (label, amount, optional discount %).</p>
      <div class="head row">
        <span>Label</span>
        <span>Amount</span>
        <span>Discount %</span>
        <span></span>
      </div>
      <div class="row" *ngFor="let row of rows; let i = index">
        <input type="text" [(ngModel)]="row.label" [disabled]="disabled" (ngModelChange)="emit()" />
        <input type="number" [(ngModel)]="row.amount" [disabled]="disabled" (ngModelChange)="emit()" />
        <input
          type="number"
          [(ngModel)]="row.discountPercent"
          [disabled]="disabled"
          (ngModelChange)="emit()"
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
        Add price
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
      }
      .lbl {
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--admin-muted);
      }
      .hint {
        margin: 0.35rem 0 0.55rem;
        font-size: 0.72rem;
        color: var(--admin-muted);
      }
      .head {
        font-size: 0.72rem;
        color: var(--admin-muted);
        margin-bottom: 0.35rem;
      }
      .head span:nth-child(4) {
        min-width: 4rem;
      }
      .row {
        display: grid;
        grid-template-columns: 1fr 100px 100px auto;
        gap: 0.45rem;
        align-items: center;
        margin-bottom: 0.4rem;
      }
      .row input {
        padding: 0.4rem 0.45rem;
        border-radius: 8px;
        border: 1px solid var(--admin-border);
        background: #0f172a;
        color: var(--admin-text);
      }
      .btn-small {
        font-size: 0.75rem;
        padding: 0.35rem 0.5rem;
      }
      .danger {
        border-color: var(--admin-danger);
        color: var(--admin-danger);
        background: transparent;
      }
      @media (max-width: 640px) {
        .row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AdminTourPricesComponent),
      multi: true,
    },
  ],
})
export class AdminTourPricesComponent implements ControlValueAccessor {
  readonly auth = inject(AdminAuthService);
  @Input() fieldHint = '';
  rows: TourPriceRow[] = [];
  disabled = false;

  private onChange: (v: TourPriceRow[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: TourPriceRow[] | null): void {
    if (!Array.isArray(value) || value.length === 0) {
      this.rows = [];
      return;
    }
    this.rows = value.map((r) => ({
      label: String(r.label ?? ''),
      amount: Number(r.amount) || 0,
      discountPercent: Number(r.discountPercent) || 0,
    }));
  }

  registerOnChange(fn: (v: TourPriceRow[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  add(): void {
    this.rows = [...this.rows, { label: '', amount: 0, discountPercent: 0 }];
    this.emit();
  }

  remove(i: number): void {
    this.rows = this.rows.filter((_, j) => j !== i);
    this.emit();
  }

  emit(): void {
    const normalized = this.rows.map((r) => ({
      label: r.label.trim(),
      amount: Number(r.amount) || 0,
      discountPercent: Math.min(100, Math.max(0, Number(r.discountPercent) || 0)),
    }));
    this.onChange(normalized);
    this.onTouched();
  }
}
