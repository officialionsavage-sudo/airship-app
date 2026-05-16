import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  PLATFORM_ID,
  SimpleChanges,
} from '@angular/core';

let modalIdSeq = 0;

/** Shell main column scroll container (see `admin-shell.component.scss`). */
const MAIN_SCROLL_SELECTOR = '.main-scroll';

@Component({
  selector: 'app-admin-modal',
  standalone: true,
  template: `
    @if (open) {
      <div class="modal-root">
        <div class="backdrop" role="presentation" (click)="backdropClose && close()"></div>
        <div class="sheet" [class.wide]="wide" role="dialog" [attr.aria-labelledby]="titleId" aria-modal="true">
          <header class="head">
            <h2 class="title" [id]="titleId">{{ title }}</h2>
            <button type="button" class="close-x" (click)="close()" aria-label="Close">×</button>
          </header>
          <div class="body">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .modal-root {
        position: fixed;
        inset: 0;
        z-index: 10500;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.25rem;
        overflow: hidden;
        overscroll-behavior: none;
      }
      .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(2, 6, 23, 0.65);
      }
      .sheet {
        position: relative;
        z-index: 1;
        width: min(100%, 520px);
        max-height: min(calc(100dvh - 2.5rem), 880px);
        display: flex;
        flex-direction: column;
        border-radius: 12px;
        border: 1px solid var(--admin-border);
        background: var(--admin-surface);
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
      }
      .sheet.wide {
        width: min(100%, 760px);
      }
      .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.85rem 1rem;
        border-bottom: 1px solid var(--admin-border);
        flex-shrink: 0;
      }
      .title {
        margin: 0;
        font-size: 1.05rem;
      }
      .close-x {
        font: inherit;
        font-size: 1.35rem;
        line-height: 1;
        padding: 0.15rem 0.45rem;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: var(--admin-muted);
        cursor: pointer;
      }
      .close-x:hover {
        color: var(--admin-text);
        background: rgba(255, 255, 255, 0.06);
      }
      .body {
        padding: 1rem;
        overflow-y: auto;
        overscroll-behavior: contain;
        flex: 1;
        min-height: 0;
        -webkit-overflow-scrolling: touch;
      }
    `,
  ],
})
export class AdminModalComponent implements OnChanges, OnDestroy {
  private static scrollLockCount = 0;
  private static scrollEl: HTMLElement | null = null;
  private static savedOverflow = '';

  @Input() open = false;
  @Input() title = '';
  /** Wider sheet for long forms (e.g. project editor). */
  @Input() wide = false;
  @Input() backdropClose = true;
  @Output() openChange = new EventEmitter<boolean>();

  readonly titleId = `adm-modal-${++modalIdSeq}`;

  private lockedByThis = false;

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!('open' in changes) || !isPlatformBrowser(this.platformId)) {
      return;
    }
    if (this.open) {
      this.acquireScrollLock();
    } else {
      this.releaseScrollLock();
    }
  }

  ngOnDestroy(): void {
    if (this.lockedByThis) {
      this.releaseScrollLock();
    }
  }

  close(): void {
    this.openChange.emit(false);
  }

  private acquireScrollLock(): void {
    if (this.lockedByThis) {
      return;
    }
    this.lockedByThis = true;
    AdminModalComponent.scrollLockCount += 1;
    if (AdminModalComponent.scrollLockCount !== 1) {
      return;
    }
    const el = document.querySelector(MAIN_SCROLL_SELECTOR) as HTMLElement | null;
    if (!el) {
      return;
    }
    AdminModalComponent.scrollEl = el;
    AdminModalComponent.savedOverflow = el.style.overflow;
    el.style.overflow = 'hidden';
  }

  private releaseScrollLock(): void {
    if (!this.lockedByThis) {
      return;
    }
    this.lockedByThis = false;
    AdminModalComponent.scrollLockCount = Math.max(0, AdminModalComponent.scrollLockCount - 1);
    if (AdminModalComponent.scrollLockCount !== 0 || !AdminModalComponent.scrollEl) {
      return;
    }
    AdminModalComponent.scrollEl.style.overflow = AdminModalComponent.savedOverflow;
    AdminModalComponent.scrollEl = null;
    AdminModalComponent.savedOverflow = '';
  }
}
