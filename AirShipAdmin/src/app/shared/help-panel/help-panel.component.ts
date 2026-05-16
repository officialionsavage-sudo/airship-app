import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-help-panel',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="help-panel">
      <button type="button" class="help-panel-toggle" (click)="open = !open" [attr.aria-expanded]="open">
        <span class="help-panel-title">{{ title }}</span>
        <span class="help-panel-hint">{{ open ? 'Hide tips ▲' : 'Show tips ▼' }}</span>
      </button>
      <div class="help-panel-body" *ngIf="open">
        <ng-content />
      </div>
    </div>
  `,
  styles: [
    `
      .help-panel {
        margin-bottom: 1rem;
        border-radius: 10px;
        border: 1px solid var(--admin-border);
        background: var(--admin-surface-2);
      }
      .help-panel-toggle {
        width: 100%;
        text-align: left;
        padding: 0.65rem 1rem;
        border: none;
        background: transparent;
        color: var(--admin-accent);
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        flex-wrap: wrap;
      }
      .help-panel-hint {
        font-size: 0.78rem;
        font-weight: 500;
        color: var(--admin-muted);
      }
      .help-panel-body {
        padding: 0 1rem 1rem;
        font-size: 0.9rem;
        line-height: 1.5;
        color: var(--admin-muted);
      }
    `,
  ],
})
export class HelpPanelComponent {
  @Input() title = 'What you are editing';
  open = false;
}
