import { NgFor, NgIf, UpperCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  inject,
} from '@angular/core';
import { CMS_LOCALES, type CmsLocale } from '../../../core/models/home-page.models';
import { LocaleService } from '../../../core/services/locale.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { animate, style, transition, trigger } from '@angular/animations';

/** Native names for the language picker (always readable). */
const LOCALE_LABELS: Record<CmsLocale, string> = {
  en: 'English',
  ar: 'العربية',
  de: 'Deutsch',
  ru: 'Русский',
};

export type LanguageSwitcherPresentation = 'dropdown' | 'drawer';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [NgFor, NgIf, UpperCasePipe, TranslatePipe],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('panelInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px) scale(0.97)' }),
        animate('220ms cubic-bezier(0.2, 0.9, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
      transition(':leave', [animate('160ms ease-out', style({ opacity: 0, transform: 'translateY(-8px)' }))]),
    ]),
  ],
})
export class LanguageSwitcherComponent {
  readonly localeSvc = inject(LocaleService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject(ElementRef<HTMLElement>);

  /** `dropdown` = header chip + floating panel. `drawer` = full list inside mobile nav. */
  @Input() presentation: LanguageSwitcherPresentation = 'dropdown';

  /** Emits after a locale is chosen (e.g. close mobile menu). */
  @Output() afterPick = new EventEmitter<void>();

  open = false;

  readonly codes = [...CMS_LOCALES];
  readonly labels = LOCALE_LABELS;

  constructor() {
    this.localeSvc.locale$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.open = false;
      this.cdr.markForCheck();
    });
  }

  trackByCode = (_: number, c: CmsLocale) => c;

  toggleOpen(): void {
    this.open = !this.open;
    this.cdr.markForCheck();
  }

  pick(code: CmsLocale): void {
    if ((CMS_LOCALES as readonly string[]).includes(code)) {
      this.localeSvc.setLocale(code);
    }
    this.open = false;
    this.afterPick.emit();
    this.cdr.markForCheck();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.presentation !== 'dropdown' || !this.open) {
      return;
    }
    const root = this.host.nativeElement;
    if (!root.contains(event.target as Node)) {
      this.open = false;
      this.cdr.markForCheck();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) {
      this.open = false;
      this.cdr.markForCheck();
    }
  }
}
