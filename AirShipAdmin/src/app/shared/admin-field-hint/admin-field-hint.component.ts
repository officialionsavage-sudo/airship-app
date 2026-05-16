import { Component, Input } from '@angular/core';

/**
 * Info icon with hover/focus tooltip. Also sets native `title` for accessibility fallback.
 */
@Component({
  selector: 'app-admin-field-hint',
  standalone: true,
  template: `
    <span
      class="admin-field-hint-host"
      tabindex="0"
      [attr.title]="text"
      [attr.aria-label]="'Hint: ' + text"
    >
      <span class="admin-field-hint-mark" aria-hidden="true">i</span>
      <span class="admin-field-hint-popover" role="tooltip">{{ text }}</span>
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        vertical-align: middle;
      }
      .admin-field-hint-host {
        position: relative;
        cursor: help;
        outline: none;
      }
      .admin-field-hint-mark {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1rem;
        height: 1rem;
        border-radius: 999px;
        font-size: 0.62rem;
        font-weight: 800;
        font-style: italic;
        line-height: 1;
        color: var(--admin-accent);
        border: 1px solid rgba(56, 189, 248, 0.55);
        background: rgba(56, 189, 248, 0.12);
        user-select: none;
      }
      .admin-field-hint-host:hover .admin-field-hint-mark,
      .admin-field-hint-host:focus-visible .admin-field-hint-mark {
        background: rgba(56, 189, 248, 0.22);
        border-color: var(--admin-accent);
      }
      .admin-field-hint-popover {
        position: absolute;
        left: 50%;
        bottom: calc(100% + 8px);
        transform: translateX(-50%);
        min-width: 200px;
        max-width: min(320px, 70vw);
        padding: 0.5rem 0.65rem;
        border-radius: 8px;
        font-size: 0.72rem;
        font-weight: 500;
        font-style: normal;
        line-height: 1.45;
        color: var(--admin-text);
        background: #1e293b;
        border: 1px solid var(--admin-border);
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
        visibility: hidden;
        opacity: 0;
        pointer-events: none;
        z-index: 200;
      }
      .admin-field-hint-host:hover .admin-field-hint-popover,
      .admin-field-hint-host:focus-visible .admin-field-hint-popover {
        visibility: visible;
        opacity: 1;
      }
    `,
  ],
})
export class AdminFieldHintComponent {
  @Input({ required: true }) text!: string;
}
