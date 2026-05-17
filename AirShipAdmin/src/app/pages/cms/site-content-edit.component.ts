import { NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  bundledHomeToStorageV2,
  mergeHomePageContent,
  migrateRawHomeToBundled,
} from '@airship-public/home-page.defaults';
import type { HomePageContent } from '@airship-public/home-page.models';
import { CMS_LOCALES, type CmsLocale } from '@airship-public/home-page.models';
import { adminApiErrorMessage } from '../../core/admin-messages';
import { apiUrl } from '../../core/api-url';
import { AdminAuthService } from '../../core/admin-auth.service';
import { requireWriteAccess } from '../../core/admin-write-access';
import { AdminNoticeService } from '../../shared/admin-notice/admin-notice.service';
import { HomeContentFormComponent } from '../../cms/home-content-form.component';
import { HelpPanelComponent } from '../../shared/help-panel/help-panel.component';
import { HomeCmsMirrorComponent } from '../../shared/home-cms-mirror/home-cms-mirror.component';
import { AdminConfirmService } from '../../shared/admin-confirm/admin-confirm.service';

@Component({
  selector: 'app-site-content-edit',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    UpperCasePipe,
    FormsModule,
    RouterLink,
    HelpPanelComponent,
    HomeCmsMirrorComponent,
    HomeContentFormComponent,
  ],
  template: `
    <a routerLink="/cms/site-content">← Back to all sections</a>
    <h1 class="page-title">Edit: {{ key }}</h1>
    <p class="page-intro" *ngIf="key === 'home'">
      Choose a language, edit fields, and use the preview — then <strong>Save</strong> to publish all locales together.
    </p>
    <app-help-panel title="Keys other than home">
      <p>
        For sections other than <code>home</code>, content is shown read-only. Ask your developer if something needs changing there.
      </p>
      <p *ngIf="key === 'home'">
        Preview reflects the selected language. The public site loads the matching branch using the visitor’s language header.
      </p>
    </app-help-panel>
    <div class="grid" [class.grid-with-preview]="key === 'home'">
      <div class="preview-col" *ngIf="key === 'home'">
        <app-home-cms-mirror
          [payload]="homeMirrorPayload"
          [parseError]="!!parseError"
          [locale]="homeLocale"
        />
      </div>
      <div class="editor">
        <div class="locale-bar" *ngIf="key === 'home' && homeDraft">
          <label>
            Language
            <select [ngModel]="homeLocale" (ngModelChange)="onHomeLocaleChange($event)">
              <option *ngFor="let loc of cmsLocales" [value]="loc">{{ loc | uppercase }}</option>
            </select>
          </label>
        </div>
        <app-home-content-form
          *ngIf="key === 'home' && homeDraft"
          [draft]="homeDraft"
          (previewSync)="onHomePreviewSync()"
        />

        <ng-container *ngIf="key !== 'home'">
          <pre class="payload-ro" *ngIf="!parseError">{{ jsonText }}</pre>
          <p class="parse-err" *ngIf="parseError">{{ parseError }}</p>
          <p class="ro-note">This payload is not editable in the admin UI.</p>
        </ng-container>

        <p class="parse-err" *ngIf="key === 'home' && parseError">{{ parseError }}</p>
        <div class="actions" *ngIf="key === 'home' && auth.canWrite()">
          <button type="button" class="btn" (click)="resetUnsaved()" [disabled]="saving || !hasUnsavedChanges">
            Discard unsaved changes
          </button>
          <button type="button" class="btn btn-primary" (click)="save()" [disabled]="saving || !!parseError">
            Save home page
          </button>
          <span class="ok" *ngIf="savedMsg">{{ savedMsg }}</span>
          <span class="err" *ngIf="saveError">{{ saveError }}</span>
        </div>
        <p *ngIf="key === 'home' && auth.isReadOnly()" class="readonly-note">Read-only: home page text cannot be changed with this account.</p>
      </div>
    </div>
  `,
  styles: [
    `
      .readonly-note {
        margin-top: 0.75rem;
        color: var(--admin-muted);
        font-size: 0.9rem;
      }
      .locale-bar {
        margin-bottom: 0.75rem;
      }
      .locale-bar label {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        font-size: 0.85rem;
        color: var(--admin-muted);
      }
      .locale-bar select {
        max-width: 220px;
        padding: 0.45rem 0.55rem;
        border-radius: 8px;
        border: 1px solid var(--admin-border);
        background: #020617;
        color: #e2e8f0;
      }
      .grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.25rem;
        align-items: start;
      }
      .editor,
      .preview-col {
        min-width: 0;
      }
      @media (min-width: 1100px) {
        .grid.grid-with-preview {
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        }
        .grid.grid-with-preview .preview-col {
          grid-column: 1;
        }
        .grid.grid-with-preview .editor {
          grid-column: 2;
        }
      }
      .payload-ro {
        margin: 0;
        padding: 0.85rem;
        border-radius: 10px;
        border: 1px solid var(--admin-border);
        background: #020617;
        color: var(--admin-muted);
        font-family: ui-monospace, monospace;
        font-size: 0.75rem;
        line-height: 1.45;
        white-space: pre-wrap;
        word-break: break-word;
        max-height: min(70vh, 520px);
        overflow: auto;
      }
      .ro-note {
        margin-top: 0.65rem;
        font-size: 0.82rem;
        color: var(--admin-muted);
      }
      .parse-err {
        color: var(--admin-danger);
        font-size: 0.85rem;
      }
      .actions {
        margin-top: 0.75rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }
      .ok {
        color: #4ade80;
        font-size: 0.85rem;
      }
      .err {
        color: var(--admin-danger);
        font-size: 0.85rem;
      }
    `,
  ],
})
export class SiteContentEditComponent implements OnInit {
  readonly auth = inject(AdminAuthService);
  private readonly confirm = inject(AdminConfirmService);
  private readonly notice = inject(AdminNoticeService);

  readonly cmsLocales = [...CMS_LOCALES];

  key = '';
  jsonText = '';
  parseError = '';
  /** Canonical JSON of stored home payload (v2 wrapper). */
  baselineCanonical = '';
  homeMirrorPayload: Record<string, unknown> | null = null;
  homeBundled: Record<CmsLocale, HomePageContent> | null = null;
  homeLocale: CmsLocale = 'en';
  homeDraft: HomePageContent | null = null;
  saving = false;
  savedMsg = '';
  saveError = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly http: HttpClient,
  ) {}

  get hasUnsavedChanges(): boolean {
    if (this.key !== 'home' || !this.baselineCanonical || !this.homeBundled) {
      return false;
    }
    return JSON.stringify(bundledHomeToStorageV2(this.homeBundled)) !== this.baselineCanonical;
  }

  ngOnInit(): void {
    this.key = this.route.snapshot.paramMap.get('key') ?? '';
    this.http.get<{ payload: unknown }>(apiUrl(`/api/admin/site-content/${encodeURIComponent(this.key)}`)).subscribe({
      next: (row) => {
        this.jsonText = JSON.stringify(row.payload, null, 2);
        this.afterPayloadLoad();
      },
      error: () => {
        this.parseError = 'This section could not be loaded. Check your password or ask support if the problem continues.';
      },
    });
  }

  onHomeLocaleChange(next: string): void {
    if (!this.homeBundled) {
      return;
    }
    if (!(CMS_LOCALES as readonly string[]).includes(next)) {
      return;
    }
    const loc = next as CmsLocale;
    if (this.homeDraft) {
      this.homeBundled[this.homeLocale] = mergeHomePageContent(this.homeDraft);
    }
    this.homeLocale = loc;
    this.homeDraft = this.homeBundled[loc];
    this.syncHomeMirrorFromDraft();
    this.savedMsg = '';
    this.saveError = '';
  }

  private afterPayloadLoad(): void {
    this.savedMsg = '';
    this.saveError = '';
    if (this.key !== 'home') {
      this.parseError = '';
      this.homeMirrorPayload = null;
      this.homeDraft = null;
      this.homeBundled = null;
      this.baselineCanonical = '';
      return;
    }
    try {
      const parsed: unknown = JSON.parse(this.jsonText);
      this.homeBundled = migrateRawHomeToBundled(parsed);
      this.homeLocale = 'en';
      this.homeDraft = this.homeBundled[this.homeLocale];
      this.baselineCanonical = JSON.stringify(bundledHomeToStorageV2(this.homeBundled));
      this.parseError = '';
      this.syncHomeMirrorFromDraft();
    } catch {
      this.parseError = 'Saved content looks corrupted. Please contact support before editing.';
      this.homeMirrorPayload = null;
      this.homeDraft = null;
      this.homeBundled = null;
      this.baselineCanonical = '';
    }
  }

  onHomePreviewSync(): void {
    if (!this.homeDraft || !this.homeBundled) {
      return;
    }
    this.homeBundled[this.homeLocale] = mergeHomePageContent(this.homeDraft);
    this.homeDraft = this.homeBundled[this.homeLocale];
    this.jsonText = JSON.stringify(bundledHomeToStorageV2(this.homeBundled), null, 2);
    this.syncHomeMirrorFromDraft();
    this.savedMsg = '';
    this.saveError = '';
    this.parseError = '';
  }

  private syncHomeMirrorFromDraft(): void {
    if (!this.homeDraft) {
      return;
    }
    this.homeMirrorPayload = structuredClone(this.homeDraft) as unknown as Record<string, unknown>;
  }

  resetUnsaved(): void {
    void this.resetUnsavedAsync();
  }

  private async resetUnsavedAsync(): Promise<void> {
    if (this.key !== 'home' || !this.hasUnsavedChanges || !this.baselineCanonical) {
      return;
    }
    const ok = await this.confirm.open({
      title: 'Discard changes?',
      message: 'Undo everything since your last successful save? This cannot be undone.',
      confirmLabel: 'Discard',
    });
    if (!ok) {
      return;
    }
    try {
      const parsed: unknown = JSON.parse(this.baselineCanonical);
      this.homeBundled = migrateRawHomeToBundled(parsed);
      this.homeDraft = this.homeBundled[this.homeLocale];
      this.jsonText = JSON.stringify(bundledHomeToStorageV2(this.homeBundled), null, 2);
      this.parseError = '';
      this.syncHomeMirrorFromDraft();
    } catch {
      return;
    }
    this.savedMsg = '';
    this.saveError = '';
  }

  save(): void {
    void this.saveAsync();
  }

  private async saveAsync(): Promise<void> {
    if (!requireWriteAccess(this.auth, this.notice)) {
      return;
    }
    if (this.key !== 'home' || !this.homeBundled || !this.homeDraft) {
      return;
    }
    this.homeBundled[this.homeLocale] = mergeHomePageContent(this.homeDraft);
    const ok = await this.confirm.open({
      title: 'Publish home page changes?',
      message: 'Visitors will see this version on the live website after saving.',
      confirmLabel: 'Save',
    });
    if (!ok) {
      return;
    }
    const payload = bundledHomeToStorageV2(this.homeBundled);
    this.saving = true;
    this.savedMsg = '';
    this.saveError = '';
    this.http.put(apiUrl(`/api/admin/site-content/${encodeURIComponent(this.key)}`), { payload }).subscribe({
      next: () => {
        this.saving = false;
        this.savedMsg = 'Saved — live on the website.';
        this.baselineCanonical = JSON.stringify(payload);
      },
      error: (e) => {
        this.saving = false;
        this.saveError = adminApiErrorMessage(e, 'Could not save. Check your connection and try again.');
      },
    });
  }
}
