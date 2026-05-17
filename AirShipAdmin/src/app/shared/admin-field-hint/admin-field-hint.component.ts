import { DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  inject,
} from '@angular/core';

let popoverLayer: HTMLDivElement | null = null;
let popoverOwner: AdminFieldHintComponent | null = null;
let scrollHideHandler: (() => void) | null = null;

/**
 * Info icon with hover/focus tooltip. Popover is portaled to `document.body` with fixed
 * positioning so it is not clipped by modal `overflow` scroll areas.
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
    `,
  ],
})
export class AdminFieldHintComponent implements OnDestroy {
  @Input({ required: true }) text!: string;

  private readonly doc = inject(DOCUMENT);
  private readonly host = inject(ElementRef<HTMLElement>);

  @HostListener('mouseenter')
  @HostListener('focusin')
  showPopover(): void {
    const layer = this.ensureLayer();
    popoverOwner = this;
    layer.textContent = this.text;
    layer.classList.add('is-visible');
    this.positionLayer(layer);
    this.bindScrollHide();
  }

  @HostListener('mouseleave', ['$event'])
  @HostListener('focusout', ['$event'])
  hidePopover(ev: FocusEvent | MouseEvent): void {
    if (popoverOwner !== this) {
      return;
    }
    if (ev.type === 'focusout') {
      const next = (ev as FocusEvent).relatedTarget as Node | null;
      if (next && this.host.nativeElement.contains(next)) {
        return;
      }
    }
    this.dismissLayer();
  }

  ngOnDestroy(): void {
    if (popoverOwner === this) {
      this.dismissLayer();
    }
  }

  private ensureLayer(): HTMLDivElement {
    if (!popoverLayer) {
      popoverLayer = this.doc.createElement('div');
      popoverLayer.className = 'admin-field-hint-popover-layer';
      popoverLayer.setAttribute('role', 'tooltip');
      this.doc.body.appendChild(popoverLayer);
    }
    return popoverLayer;
  }

  private positionLayer(layer: HTMLDivElement): void {
    const hostRect = this.host.nativeElement.getBoundingClientRect();
    layer.style.left = '0';
    layer.style.top = '0';
    layer.style.visibility = 'hidden';
    layer.style.display = 'block';

    const popW = layer.offsetWidth;
    const popH = layer.offsetHeight;
    const gap = 8;
    const pad = 8;

    let top = hostRect.top - popH - gap;
    if (top < pad) {
      top = hostRect.bottom + gap;
    }

    let left = hostRect.left + hostRect.width / 2 - popW / 2;
    left = Math.max(pad, Math.min(left, window.innerWidth - popW - pad));

    layer.style.left = `${Math.round(left)}px`;
    layer.style.top = `${Math.round(top)}px`;
    layer.style.visibility = '';
  }

  private bindScrollHide(): void {
    this.unbindScrollHide();
    scrollHideHandler = () => {
      if (popoverOwner === this) {
        this.dismissLayer();
      }
    };
    this.doc.defaultView?.addEventListener('scroll', scrollHideHandler, true);
  }

  private unbindScrollHide(): void {
    if (scrollHideHandler) {
      this.doc.defaultView?.removeEventListener('scroll', scrollHideHandler, true);
      scrollHideHandler = null;
    }
  }

  private dismissLayer(): void {
    popoverOwner = null;
    popoverLayer?.classList.remove('is-visible');
    this.unbindScrollHide();
  }
}
