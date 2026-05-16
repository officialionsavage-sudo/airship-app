import { NgFor, NgIf, UpperCasePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import type { CmsLocale } from '@airship-public/home-page.models';
import { CMS_LOCALES } from '@airship-public/home-page.models';
import { environment } from '../../../environments/environment';

/** Must match `AIRSHIP_HOME_CMS_PREVIEW_TYPE` in AirShipApp `cms-preview.constants.ts`. */
const AIRSHIP_HOME_CMS_PREVIEW_TYPE = 'AIRSHIP_HOME_CMS_PREVIEW';

const PREVIEW_LOCALE_LABELS: Record<CmsLocale, string> = {
  en: 'English',
  ar: 'العربية',
  de: 'Deutsch',
  ru: 'Русский',
};

@Component({
  selector: 'app-home-cms-mirror',
  standalone: true,
  imports: [NgIf, NgFor, UpperCasePipe],
  template: `
    <div class="mirror-wrap">
      <p class="mirror-intro" *ngIf="previewSafeUrl">
        <strong>Live mirror</strong> — run <code>AirShipApp</code> on <strong>4200</strong>; each tab keeps the real
        <strong>width∶height</strong> ratio, scaled to fit.
      </p>
      <p class="mirror-warn" *ngIf="!previewSafeUrl">
        Set <code>environment.publicSiteOrigin</code> (e.g. <code>http://localhost:4200</code>).
      </p>

      <ng-container *ngIf="previewSafeUrl">
        <div class="parse-hint" *ngIf="parseError">Invalid JSON — preview paused.</div>

        <div class="preview-panel">
          <div
            class="preview-locale-bar"
            [class.preview-locale-bar--flash]="localeFlash"
            role="status"
            aria-live="polite"
          >
            <span class="preview-locale-kicker">Preview language</span>
            <strong class="preview-locale-name">{{ localeDisplay }}</strong>
            <span class="preview-locale-code">{{ locale | uppercase }}</span>
          </div>
          <div class="tabs" role="tablist" aria-label="Preview viewport">
            <button
              type="button"
              *ngFor="let d of devices; let i = index"
              class="tab"
              [class.active]="selectedTab === i"
              (click)="selectTab(i)"
              role="tab"
              [attr.aria-selected]="selectedTab === i"
              [attr.id]="'pv-tab-' + i"
            >
              {{ d.shortLabel }}
            </button>
          </div>

          <div class="viewport-shell" role="tabpanel" [attr.aria-labelledby]="'pv-tab-' + selectedTab">
            <div class="viewport-meta">{{ activeDevice.label }} · scaled to fit (aspect preserved)</div>
            <div class="device-scroll" #viewportSlot>
              <div class="scaled-stage">
                <div
                  class="clip"
                  [style.width.px]="activeDevice.w * previewScale"
                  [style.height.px]="activeDevice.h * previewScale"
                >
                  <div
                    class="scaled-inner"
                    [style.width.px]="activeDevice.w"
                    [style.height.px]="activeDevice.h"
                    [style.transform]="'scale(' + previewScale + ')'"
                  >
                    <iframe
                      #mirrorIframe
                      [src]="previewSafeUrl"
                      [width]="activeDevice.w"
                      [height]="activeDevice.h"
                      title="Public site preview"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                      loading="lazy"
                      (load)="onIframeLoaded()"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [
    `
      .mirror-wrap {
        min-width: 0;
      }
      .mirror-intro,
      .mirror-warn {
        margin: 0 0 0.45rem;
        font-size: 0.72rem;
        color: var(--admin-muted);
        line-height: 1.35;
      }
      .mirror-warn {
        color: var(--admin-danger);
      }
      code {
        font-size: 0.68rem;
        color: var(--admin-accent);
      }
      .parse-hint {
        margin: 0 0 0.35rem;
        font-size: 0.72rem;
        color: var(--admin-danger);
      }
      .preview-panel {
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid var(--admin-border);
        background: #050914;
      }
      .preview-locale-bar {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.35rem 0.55rem;
        padding: 0.5rem 0.65rem;
        border-bottom: 1px solid var(--admin-border);
        background: linear-gradient(90deg, rgba(14, 165, 233, 0.12), rgba(14, 165, 233, 0.04));
        transition: background-color 0.25s ease, box-shadow 0.25s ease;
      }
      .preview-locale-bar--flash {
        background: linear-gradient(90deg, rgba(56, 189, 248, 0.28), rgba(14, 165, 233, 0.1));
        box-shadow: inset 0 0 0 1px rgba(125, 211, 252, 0.45);
      }
      .preview-locale-kicker {
        font-size: 0.68rem;
        color: var(--admin-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .preview-locale-name {
        font-size: 0.88rem;
        color: var(--admin-text);
      }
      .preview-locale-code {
        margin-inline-start: auto;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        color: var(--admin-accent);
        padding: 0.15rem 0.45rem;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.35);
        background: rgba(2, 6, 23, 0.55);
      }
      .tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
        padding: 0.4rem 0.5rem;
        background: linear-gradient(180deg, #0f172a 0%, #0c1324 100%);
        border-bottom: 1px solid var(--admin-border);
      }
      .tab {
        font: inherit;
        font-size: 0.78rem;
        font-weight: 600;
        padding: 0.38rem 0.75rem;
        border-radius: 8px;
        border: 1px solid transparent;
        background: transparent;
        color: var(--admin-muted);
        cursor: pointer;
      }
      .tab:hover {
        color: var(--admin-text);
        background: rgba(255, 255, 255, 0.06);
      }
      .tab.active {
        color: #0f172a;
        background: var(--admin-accent);
        border-color: #7dd3fc;
      }
      .viewport-shell {
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
      .viewport-meta {
        font-size: 0.68rem;
        color: var(--admin-muted);
        padding: 0.35rem 0.55rem;
        border-bottom: 1px solid var(--admin-border);
        background: #0a0f1c;
      }
      .device-scroll {
        height: min(58vh, 680px);
        overflow: auto;
        background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(14, 165, 233, 0.06), transparent 55%), #050914;
      }
      .scaled-stage {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100%;
        padding: 12px;
        box-sizing: border-box;
      }
      .clip {
        position: relative;
        overflow: hidden;
        flex-shrink: 0;
        border-radius: 10px;
        box-shadow:
          0 0 0 1px rgba(255, 255, 255, 0.06),
          0 14px 36px rgba(0, 0, 0, 0.42);
      }
      .scaled-inner {
        position: absolute;
        top: 0;
        left: 0;
        transform-origin: 0 0;
        pointer-events: auto;
      }
      iframe {
        display: block;
        border: 0;
      }
    `,
  ],
})
export class HomeCmsMirrorComponent implements AfterViewInit, OnChanges, OnDestroy {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly ngZone = inject(NgZone);

  readonly bareOrigin = (environment.publicSiteOrigin ?? '').trim().replace(/\/$/, '');
  readonly previewSafeUrl: SafeResourceUrl | null = this.bareOrigin
    ? this.sanitizer.bypassSecurityTrustResourceUrl(`${this.bareOrigin}/?cmsPreview=1`)
    : null;

  @Input() payload: Record<string, unknown> | null = null;
  @Input() parseError = false;
  @Input() locale: CmsLocale = 'en';

  localeFlash = false;

  readonly devices = [
    { shortLabel: 'Phone', label: '390 × 844', w: 390, h: 844 },
    { shortLabel: 'Tablet', label: '768 × 1024', w: 768, h: 1024 },
    { shortLabel: 'Desktop', label: '1280 × 900', w: 1280, h: 900 },
  ];

  selectedTab = 0;
  /** Uniform scale so logical iframe (w×h) fits the preview pane without distortion. */
  previewScale = 0.35;

  @ViewChild('mirrorIframe') iframeRef?: ElementRef<HTMLIFrameElement>;
  @ViewChild('viewportSlot') viewportSlot?: ElementRef<HTMLElement>;

  private debounce?: ReturnType<typeof setTimeout>;
  private localeFlashTimer?: ReturnType<typeof setTimeout>;
  private resizeObserver?: ResizeObserver;

  get localeDisplay(): string {
    return PREVIEW_LOCALE_LABELS[this.locale] ?? this.locale.toUpperCase();
  }

  get activeDevice(): { shortLabel: string; label: string; w: number; h: number } {
    return this.devices[this.selectedTab] ?? this.devices[0];
  }

  selectTab(index: number): void {
    if (index < 0 || index >= this.devices.length) {
      return;
    }
    this.selectedTab = index;
    queueMicrotask(() => {
      this.recomputePreviewScale();
      this.broadcast();
    });
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      this.attachResizeObserver();
      this.recomputePreviewScale();
      this.broadcast();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['locale'] && !changes['locale'].firstChange) {
      this.flashLocaleChange();
    }
    if (changes['parseError'] || changes['payload'] || changes['locale']) {
      if (this.debounce != null) {
        clearTimeout(this.debounce);
      }
      this.debounce = setTimeout(() => this.broadcast(), 160);
    }
    if (this.previewSafeUrl && this.viewportSlot?.nativeElement) {
      queueMicrotask(() => this.recomputePreviewScale());
    }
  }

  ngOnDestroy(): void {
    if (this.debounce != null) {
      clearTimeout(this.debounce);
    }
    if (this.localeFlashTimer != null) {
      clearTimeout(this.localeFlashTimer);
    }
    this.resizeObserver?.disconnect();
  }

  private flashLocaleChange(): void {
    this.localeFlash = true;
    if (this.localeFlashTimer != null) {
      clearTimeout(this.localeFlashTimer);
    }
    this.localeFlashTimer = setTimeout(() => {
      this.localeFlash = false;
      this.localeFlashTimer = undefined;
    }, 1400);
  }

  onIframeLoaded(): void {
    this.broadcast();
  }

  private attachResizeObserver(): void {
    const host = this.viewportSlot?.nativeElement;
    if (!host || typeof ResizeObserver === 'undefined') {
      return;
    }
    this.resizeObserver?.disconnect();
    this.resizeObserver = new ResizeObserver(() => {
      this.ngZone.run(() => this.recomputePreviewScale());
    });
    this.resizeObserver.observe(host);
  }

  private recomputePreviewScale(): void {
    const host = this.viewportSlot?.nativeElement;
    const d = this.activeDevice;
    if (!host || !d.w || !d.h) {
      return;
    }
    const pad = 28;
    const cw = Math.max(0, host.clientWidth - pad);
    const ch = Math.max(0, host.clientHeight - pad);
    if (cw <= 0 || ch <= 0) {
      this.previewScale = 0.2;
      return;
    }
    const sx = cw / d.w;
    const sy = ch / d.h;
    const s = Math.min(sx, sy, 1);
    this.previewScale = Number.isFinite(s) && s > 0 ? s : 0.2;
  }

  private broadcast(): void {
    if (!this.bareOrigin || !this.previewSafeUrl || this.parseError || !this.payload) {
      return;
    }
    const win = this.iframeRef?.nativeElement?.contentWindow;
    if (!win) {
      return;
    }
    const locale = (CMS_LOCALES as readonly string[]).includes(this.locale) ? this.locale : 'en';
    win.postMessage(
      { type: AIRSHIP_HOME_CMS_PREVIEW_TYPE, payload: this.payload, locale },
      this.bareOrigin,
    );
  }
}
