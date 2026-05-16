import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-admin-pagination-bar',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="bar" *ngIf="total > 0">
      <span class="meta">
        Page {{ page }} of {{ totalPages }}
        <span class="meta-sep">·</span>
        Showing {{ total }} {{ itemLabel }}
      </span>
      <div class="nav">
        <button type="button" class="btn btn-small" [disabled]="page <= 1" (click)="emit(page - 1)">
          Previous
        </button>
        <button type="button" class="btn btn-small" [disabled]="page >= totalPages" (click)="emit(page + 1)">
          Next
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.65rem;
        margin-top: 0.75rem;
        padding: 0.5rem 0.65rem;
        border-radius: 10px;
        border: 1px solid var(--admin-border);
        background: var(--admin-surface);
      }
      .meta {
        font-size: 0.82rem;
        color: var(--admin-muted);
      }
      .meta-sep {
        margin: 0 0.25rem;
      }
      .nav {
        display: flex;
        gap: 0.45rem;
      }
      .btn-small {
        font-size: 0.78rem;
        padding: 0.35rem 0.65rem;
      }
    `,
  ],
})
export class AdminPaginationBarComponent {
  /** Plural label for the total count, e.g. "cities", "projects". */
  @Input() itemLabel = 'items';
  @Input() page = 1;
  @Input() pageSize = 20;
  @Input() total = 0;
  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / Math.max(1, this.pageSize)));
  }

  emit(next: number): void {
    if (next < 1 || next > this.totalPages) {
      return;
    }
    this.pageChange.emit(next);
  }
}
