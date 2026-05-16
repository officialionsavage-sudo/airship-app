import { NgFor } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { HomePageContent } from '@airship-public/home-page.models';
import { HOME_HINTS } from '../shared/admin-field-hint/admin-field-hints.constants';
import { AdminFieldHintComponent } from '../shared/admin-field-hint/admin-field-hint.component';
import { AdminImageFieldComponent } from '../shared/admin-image-field/admin-image-field.component';

@Component({
  selector: 'app-home-content-form',
  standalone: true,
  imports: [FormsModule, NgFor, AdminImageFieldComponent, AdminFieldHintComponent],
  template: `
    <div class="home-form admin-scroll">
      <fieldset class="block">
        <legend>Hero</legend>
        <div class="field">
          <label class="field-label-with-hint" for="h-kicker">
            Kicker
            <app-admin-field-hint [text]="hh.heroKicker" />
          </label>
          <input id="h-kicker" [(ngModel)]="draft.hero.kicker" (blur)="notifyPreviewFromBlur()" />
        </div>
        <div class="field">
          <label class="field-label-with-hint" for="h-prefix">
            Title prefix
            <app-admin-field-hint [text]="hh.heroTitlePrefix" />
          </label>
          <input id="h-prefix" [(ngModel)]="draft.hero.titlePrefix" (blur)="notifyPreviewFromBlur()" />
        </div>
        <div class="field">
          <label class="field-label-with-hint" for="h-sub">
            Subtitle
            <app-admin-field-hint [text]="hh.heroSubtitle" />
          </label>
          <textarea id="h-sub" rows="3" [(ngModel)]="draft.hero.subtitle" (blur)="notifyPreviewFromBlur()"></textarea>
        </div>
        <div class="field">
          <label class="field-label-with-hint" for="h-type">
            Typing phrases (one per line)
            <app-admin-field-hint [text]="hh.heroTyping" />
          </label>
          <textarea
            id="h-type"
            rows="5"
            [ngModel]="typingPhrasesText"
            (ngModelChange)="onTypingPhrasesInput($event)"
            (blur)="notifyPreviewFromBlur()"
          ></textarea>
        </div>
        <div class="field">
          <label class="field-label-with-hint" for="h-type-aria">
            Typing aria label (optional)
            <app-admin-field-hint [text]="hh.heroTypingAria" />
          </label>
          <input id="h-type-aria" [(ngModel)]="draft.hero.typingAriaLabel" (blur)="notifyPreviewFromBlur()" />
        </div>
        <fieldset class="nested">
          <legend>Hero logo</legend>
          <div class="field field-full">
            <app-admin-image-field
              [(ngModel)]="draft.hero.heroLogo.src"
              label="Logo image"
              uploadScope="cms"
              [fieldHint]="hh.heroLogoImage"
              (imageChange)="notifyPreviewImmediate()"
            />
          </div>
          <div class="field">
            <label class="field-label-with-hint" for="hl-alt">
              Logo alt (optional)
              <app-admin-field-hint [text]="hh.heroLogoAlt" />
            </label>
            <input id="hl-alt" [(ngModel)]="draft.hero.heroLogo.alt" (blur)="notifyPreviewFromBlur()" />
          </div>
        </fieldset>
        <fieldset class="nested">
          <legend>Primary CTA</legend>
          <div class="field">
            <label class="field-label-with-hint" for="pc-l">
              Label
              <app-admin-field-hint [text]="hh.heroPrimaryCtaLabel" />
            </label>
            <input id="pc-l" [(ngModel)]="draft.hero.primaryCta.label" (blur)="notifyPreviewFromBlur()" />
          </div>
          <div class="field">
            <label class="field-label-with-hint" for="pc-h">
              Href (e.g. #cities)
              <app-admin-field-hint [text]="hh.heroPrimaryCtaHref" />
            </label>
            <input id="pc-h" [(ngModel)]="draft.hero.primaryCta.href" (blur)="notifyPreviewFromBlur()" />
          </div>
        </fieldset>
        <fieldset class="nested">
          <legend>Secondary CTA</legend>
          <div class="field">
            <label class="field-label-with-hint" for="sc-l">
              Label
              <app-admin-field-hint [text]="hh.heroSecondaryCtaLabel" />
            </label>
            <input id="sc-l" [(ngModel)]="draft.hero.secondaryCta.label" (blur)="notifyPreviewFromBlur()" />
          </div>
          <div class="field">
            <label class="field-label-with-hint" for="sc-r">
              Router link
              <app-admin-field-hint [text]="hh.heroSecondaryRouterLink" />
            </label>
            <input id="sc-r" [(ngModel)]="draft.hero.secondaryCta.routerLink" (blur)="notifyPreviewFromBlur()" />
          </div>
          <div class="field">
            <label class="field-label-with-hint" for="sc-c">
              Chip (optional)
              <app-admin-field-hint [text]="hh.heroSecondaryChip" />
            </label>
            <input id="sc-c" [(ngModel)]="draft.hero.secondaryCta.chip" (blur)="notifyPreviewFromBlur()" />
          </div>
        </fieldset>
        <div class="field">
          <label class="field-label-with-hint" for="h-scroll">
            Scroll indicator label
            <app-admin-field-hint [text]="hh.heroScrollLabel" />
          </label>
          <input id="h-scroll" [(ngModel)]="draft.hero.scrollIndicatorLabel" (blur)="notifyPreviewFromBlur()" />
        </div>
        <div class="field">
          <label class="field-label-with-hint" for="h-scroll-a">
            Scroll indicator aria (optional)
            <app-admin-field-hint [text]="hh.heroScrollAria" />
          </label>
          <input id="h-scroll-a" [(ngModel)]="draft.hero.scrollIndicatorAriaLabel" (blur)="notifyPreviewFromBlur()" />
        </div>
      </fieldset>

      <fieldset class="block">
        <legend>Cities section</legend>
        <div class="field">
          <label class="field-label-with-hint" for="cs-t">
            Title
            <app-admin-field-hint [text]="hh.citiesSectionTitle" />
          </label>
          <input id="cs-t" [(ngModel)]="draft.citiesSection.title" (blur)="notifyPreviewFromBlur()" />
        </div>
        <div class="field">
          <label class="field-label-with-hint" for="cs-d">
            Description
            <app-admin-field-hint [text]="hh.citiesSectionDesc" />
          </label>
          <textarea id="cs-d" rows="3" [(ngModel)]="draft.citiesSection.description" (blur)="notifyPreviewFromBlur()"></textarea>
        </div>
      </fieldset>

      <fieldset class="block">
        <legend>About</legend>
        <div class="field">
          <label class="field-label-with-hint" for="ab-k">
            Kicker
            <app-admin-field-hint [text]="hh.aboutKicker" />
          </label>
          <input id="ab-k" [(ngModel)]="draft.about.kicker" (blur)="notifyPreviewFromBlur()" />
        </div>
        <div class="field">
          <label class="field-label-with-hint" for="ab-t">
            Title
            <app-admin-field-hint [text]="hh.aboutTitle" />
          </label>
          <input id="ab-t" [(ngModel)]="draft.about.title" (blur)="notifyPreviewFromBlur()" />
        </div>
        <div class="field">
          <label class="field-label-with-hint" for="ab-l">
            Lead
            <app-admin-field-hint [text]="hh.aboutLead" />
          </label>
          <textarea id="ab-l" rows="4" [(ngModel)]="draft.about.lead" (blur)="notifyPreviewFromBlur()"></textarea>
        </div>

        <div class="subhead">Points</div>
        <div class="repeat-block" *ngFor="let p of draft.about.points; let i = index">
          <div class="repeat-head">
            <span>Point {{ i + 1 }}</span>
            <button type="button" class="btn btn-danger btn-tiny" (click)="removePoint(i)">Remove</button>
          </div>
          <div class="field">
            <label class="field-label-with-hint" [attr.for]="'pt-' + i">
              Title
              <app-admin-field-hint [text]="hh.aboutPointTitle" />
            </label>
            <input [id]="'pt-' + i" [(ngModel)]="p.title" (blur)="notifyPreviewFromBlur()" />
          </div>
          <div class="field">
            <label class="field-label-with-hint" [attr.for]="'pb-' + i">
              Body
              <app-admin-field-hint [text]="hh.aboutPointBody" />
            </label>
            <textarea [id]="'pb-' + i" rows="2" [(ngModel)]="p.body" (blur)="notifyPreviewFromBlur()"></textarea>
          </div>
        </div>
        <button type="button" class="btn" (click)="addPoint()">Add point</button>

        <div class="subhead">Stats</div>
        <div class="repeat-block" *ngFor="let s of draft.about.stats; let i = index">
          <div class="repeat-head">
            <span>Stat {{ i + 1 }}</span>
            <button type="button" class="btn btn-danger btn-tiny" (click)="removeStat(i)">Remove</button>
          </div>
          <div class="row2">
            <div class="field">
              <label class="field-label-with-hint" [attr.for]="'sv-' + i">
                Value
                <app-admin-field-hint [text]="hh.aboutStatValue" />
              </label>
              <input [id]="'sv-' + i" [(ngModel)]="s.value" (blur)="notifyPreviewFromBlur()" />
            </div>
            <div class="field">
              <label class="field-label-with-hint" [attr.for]="'sl-' + i">
                Label
                <app-admin-field-hint [text]="hh.aboutStatLabel" />
              </label>
              <input [id]="'sl-' + i" [(ngModel)]="s.label" (blur)="notifyPreviewFromBlur()" />
            </div>
          </div>
        </div>
        <button type="button" class="btn" (click)="addStat()">Add stat</button>

        <div class="subhead">Visual cards</div>
        <div class="repeat-block" *ngFor="let c of draft.about.visualCards; let i = index">
          <div class="repeat-head">
            <span>Card {{ i + 1 }}</span>
            <button type="button" class="btn btn-danger btn-tiny" (click)="removeCard(i)">Remove</button>
          </div>
          <div class="field">
            <label class="field-label-with-hint" [attr.for]="'vb-' + i">
              Badge
              <app-admin-field-hint [text]="hh.aboutCardBadge" />
            </label>
            <input [id]="'vb-' + i" [(ngModel)]="c.badge" (blur)="notifyPreviewFromBlur()" />
          </div>
          <div class="field">
            <label class="field-label-with-hint" [attr.for]="'vt-' + i">
              Title
              <app-admin-field-hint [text]="hh.aboutCardTitle" />
            </label>
            <input [id]="'vt-' + i" [(ngModel)]="c.title" (blur)="notifyPreviewFromBlur()" />
          </div>
          <div class="field">
            <label class="field-label-with-hint" [attr.for]="'vs-' + i">
              Subtitle
              <app-admin-field-hint [text]="hh.aboutCardSubtitle" />
            </label>
            <input [id]="'vs-' + i" [(ngModel)]="c.subtitle" (blur)="notifyPreviewFromBlur()" />
          </div>
        </div>
        <button type="button" class="btn" (click)="addCard()">Add card</button>
      </fieldset>

      <fieldset class="block">
        <legend>Testimonials section</legend>
        <div class="field">
          <label class="field-label-with-hint" for="ts-t">
            Title
            <app-admin-field-hint [text]="hh.testimonialsSectionTitle" />
          </label>
          <input id="ts-t" [(ngModel)]="draft.testimonialsSection.title" (blur)="notifyPreviewFromBlur()" />
        </div>
        <div class="field">
          <label class="field-label-with-hint" for="ts-d">
            Description
            <app-admin-field-hint [text]="hh.testimonialsSectionDesc" />
          </label>
          <textarea id="ts-d" rows="3" [(ngModel)]="draft.testimonialsSection.description" (blur)="notifyPreviewFromBlur()"></textarea>
        </div>
      </fieldset>
    </div>
  `,
  styles: [
    `
      .home-form {
        padding: 0.75rem 1rem 1rem;
        max-height: min(62vh, 720px);
      }
      .block {
        border: 1px solid var(--admin-border);
        border-radius: 10px;
        padding: 0.75rem 1rem 1rem;
        margin: 0 0 1rem;
      }
      .block legend {
        padding: 0 0.35rem;
        font-weight: 700;
        font-size: 0.9rem;
        color: var(--admin-accent);
      }
      .nested {
        border: 1px dashed var(--admin-border);
        border-radius: 8px;
        padding: 0.65rem 0.85rem;
        margin: 0.75rem 0;
      }
      .nested legend {
        font-size: 0.78rem;
        color: var(--admin-muted);
      }
      .subhead {
        margin: 1rem 0 0.5rem;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--admin-muted);
      }
      .repeat-block {
        padding: 0.65rem 0 0.85rem;
        margin-bottom: 0.65rem;
        border-bottom: 1px solid var(--admin-border);
      }
      .repeat-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
        font-size: 0.8rem;
        color: var(--admin-muted);
      }
      .btn-tiny {
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
      }
      .row2 {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 0.65rem;
      }
      input,
      textarea {
        width: 100%;
        padding: 0.45rem 0.55rem;
        border-radius: 8px;
        border: 1px solid var(--admin-border);
        background: #020617;
        color: var(--admin-text);
      }
    `,
  ],
})
export class HomeContentFormComponent implements OnChanges {
  @Input({ required: true }) draft!: HomePageContent;
  /** Emitted when the iframe preview should refresh (blur with real change, or list/card edits). */
  @Output() previewSync = new EventEmitter<void>();

  readonly hh = HOME_HINTS;
  private lastPreviewSnap = '';

  get typingPhrasesText(): string {
    return this.draft.hero.typingPhrases.join('\n');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['draft'] && this.draft) {
      this.lastPreviewSnap = JSON.stringify(this.draft);
    }
  }

  onTypingPhrasesInput(v: string): void {
    this.draft.hero.typingPhrases = v
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  notifyPreviewFromBlur(): void {
    const snap = JSON.stringify(this.draft);
    if (snap === this.lastPreviewSnap) {
      return;
    }
    this.lastPreviewSnap = snap;
    this.previewSync.emit();
  }

  notifyPreviewImmediate(): void {
    this.lastPreviewSnap = JSON.stringify(this.draft);
    this.previewSync.emit();
  }

  addPoint(): void {
    this.draft.about.points.push({ title: '', body: '' });
    this.notifyPreviewImmediate();
  }

  removePoint(i: number): void {
    this.draft.about.points.splice(i, 1);
    this.notifyPreviewImmediate();
  }

  addStat(): void {
    this.draft.about.stats.push({ value: '', label: '' });
    this.notifyPreviewImmediate();
  }

  removeStat(i: number): void {
    this.draft.about.stats.splice(i, 1);
    this.notifyPreviewImmediate();
  }

  addCard(): void {
    this.draft.about.visualCards.push({ badge: '', title: '', subtitle: '' });
    this.notifyPreviewImmediate();
  }

  removeCard(i: number): void {
    this.draft.about.visualCards.splice(i, 1);
    this.notifyPreviewImmediate();
  }
}
