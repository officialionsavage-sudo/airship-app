import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactApiService } from '../../core/services/contact-api.service';
import { ToastService } from '../../core/services/toast.service';
import { SiteSettingsService } from '../../core/services/site-settings.service';
import { TranslationService } from '../../core/services/translation.service';
import { resolveSiteContact, type ResolvedSiteContact } from '../../core/site-contact';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.scss',
})
export class ContactUsComponent implements OnInit {
  submitting = false;
  contact: ResolvedSiteContact = resolveSiteContact({});

  readonly form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(8)]],
    subject: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly contactApi: ContactApiService,
    private readonly destroyRef: DestroyRef,
    private readonly siteSettings: SiteSettingsService,
    private readonly toast: ToastService,
    private readonly i18n: TranslationService,
  ) {}

  ngOnInit(): void {
    this.siteSettings
      .getContact()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((contact) => {
        this.contact = contact;
      });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const values = this.form.getRawValue();
    this.contactApi
      .submitContact({
        fullName: values.fullName ?? '',
        email: values.email ?? '',
        phone: values.phone ?? '',
        subject: values.subject ?? '',
        message: values.message ?? '',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.submitting = false;
        const detail = response.message?.trim();
        const subject = values.subject ?? '';
        const msg = detail
          ? this.i18n.t('contactPage.toastThanksDetail').replace('{detail}', detail)
          : this.i18n.t('contactPage.toastThanksSubject').replace('{subject}', subject);
        this.toast.success(msg);
        this.form.reset();
      });
  }

  openWhatsApp(): void {
    const message = this.i18n.t('contactPage.waPresetMessage');
    const url = `https://wa.me/${this.contact.waDigits}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  openLocation(): void {
    const query = encodeURIComponent(this.contact.mapsQuery);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer');
  }
}
