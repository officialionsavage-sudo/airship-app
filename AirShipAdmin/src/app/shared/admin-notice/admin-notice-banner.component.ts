import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AdminNoticeService } from './admin-notice.service';

@Component({
  selector: 'app-admin-notice-banner',
  standalone: true,
  imports: [NgIf],
  template: `
    <div *ngIf="notices.notice() as n" [class]="'admin-notice admin-notice-' + n.kind" role="status">
      <p class="admin-notice-text">{{ n.text }}</p>
      <button type="button" class="admin-notice-dismiss btn" (click)="notices.dismiss()" aria-label="Dismiss message">
        ✕
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .admin-notice {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.65rem 0.85rem;
        margin-bottom: 0.85rem;
        border-radius: 10px;
        border: 1px solid var(--admin-border);
        font-size: 0.9rem;
        line-height: 1.45;
      }
      .admin-notice-success {
        background: rgba(34, 197, 94, 0.12);
        border-color: rgba(34, 197, 94, 0.35);
        color: #bbf7d0;
      }
      .admin-notice-error {
        background: rgba(248, 113, 113, 0.1);
        border-color: rgba(248, 113, 113, 0.35);
        color: #fecaca;
      }
      .admin-notice-info {
        background: rgba(56, 189, 248, 0.1);
        border-color: rgba(56, 189, 248, 0.3);
        color: #e0f2fe;
      }
      .admin-notice-text {
        margin: 0;
        flex: 1;
      }
      .admin-notice-dismiss {
        flex-shrink: 0;
        padding: 0.2rem 0.45rem;
        font-size: 0.85rem;
        line-height: 1;
        opacity: 0.85;
      }
    `,
  ],
})
export class AdminNoticeBannerComponent {
  readonly notices = inject(AdminNoticeService);
}
