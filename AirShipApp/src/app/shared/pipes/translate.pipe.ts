import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../../core/services/translation.service';

@Pipe({
  name: 't',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly tr = inject(TranslationService);

  transform(key: string): string {
    this.tr.i18nEpoch();
    return this.tr.t(key);
  }
}
