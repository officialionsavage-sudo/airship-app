import { Component, inject } from '@angular/core';
import { AdminConfirmService } from './admin-confirm.service';

@Component({
  selector: 'app-admin-confirm-host',
  standalone: true,
  template: `
    @if (svc.dialog(); as d) {
      <div class="confirm-root">
        <div class="backdrop" role="presentation" (click)="svc.close(false)"></div>
        <div class="dialog" role="alertdialog" aria-modal="true">
          <h3 class="title">{{ d.title }}</h3>
          <p class="msg">{{ d.message }}</p>
          <div class="actions">
            <button type="button" class="btn" (click)="svc.close(false)">{{ d.cancelLabel }}</button>
            <button type="button" class="btn btn-primary" (click)="svc.close(true)">{{ d.confirmLabel }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .confirm-root {
        position: fixed;
        inset: 0;
        z-index: 11000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
      }
      .backdrop {
        position: absolute;
        inset: 0;
        background: rgba(2, 6, 23, 0.72);
      }
      .dialog {
        position: relative;
        z-index: 1;
        width: min(100%, 420px);
        padding: 1.25rem;
        border-radius: 12px;
        border: 1px solid var(--admin-border);
        background: var(--admin-surface);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
      }
      .title {
        margin: 0 0 0.5rem;
        font-size: 1.05rem;
      }
      .msg {
        margin: 0 0 1rem;
        font-size: 0.9rem;
        color: var(--admin-muted);
        line-height: 1.45;
        white-space: pre-wrap;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
    `,
  ],
})
export class AdminConfirmHostComponent {
  readonly svc = inject(AdminConfirmService);
}
