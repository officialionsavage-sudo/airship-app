import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SiteSettingsService } from '../../../core/services/site-settings.service';
import { resolveSiteContact } from '../../../core/site-contact';
import { buildWhatsAppUrl } from '../../../core/utils/whatsapp.util';

const FLOAT_WA_CONTEXT = {
  fullName: 'Website Visitor',
  phone: 'Not Provided',
  city: 'Egypt',
  interestType: 'general' as const,
  relatedTitle: 'Tourism + Real Estate Inquiry',
  notes: 'I want details about available projects, tours, and special offers.',
};

@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  imports: [],
  templateUrl: './whatsapp-button.component.html',
  styleUrl: './whatsapp-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhatsappButtonComponent {
  private readonly siteSettings = inject(SiteSettingsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly whatsappUrl = signal(
    buildWhatsAppUrl(FLOAT_WA_CONTEXT, {
      waDigits: resolveSiteContact({}).waDigits,
    }),
  );

  constructor() {
    this.siteSettings
      .getContact()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ waDigits }) => {
        this.whatsappUrl.set(buildWhatsAppUrl(FLOAT_WA_CONTEXT, { waDigits }));
      });
  }
}
