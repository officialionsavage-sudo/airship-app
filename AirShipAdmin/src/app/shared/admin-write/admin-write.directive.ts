import { Directive, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AdminAuthService } from '../../core/admin-auth.service';

/** Renders template content only when the signed-in user can write (admin role). */
@Directive({
  selector: '[adminWrite]',
  standalone: true,
})
export class AdminWriteDirective {
  private readonly auth = inject(AdminAuthService);
  private readonly tpl = inject(TemplateRef<unknown>);
  private readonly vcr = inject(ViewContainerRef);

  constructor() {
    effect(() => {
      this.vcr.clear();
      if (this.auth.canWrite()) {
        this.vcr.createEmbeddedView(this.tpl);
      }
    });
  }
}
