import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-preloader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-preloader.component.html',
  styleUrl: './app-preloader.component.scss',
})
export class AppPreloaderComponent implements OnInit, OnDestroy {
  visible = true;
  leaving = false;
  reducedMotion = false;
  private startTimer?: ReturnType<typeof setTimeout>;
  private hideTimer?: ReturnType<typeof setTimeout>;

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: object,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.visible = false;
      return;
    }

    this.reducedMotion = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.startTimer = setTimeout(() => {
      globalThis.document?.documentElement.classList.remove('airship-boot-pending');
      this.leaving = true;
      this.cdr.markForCheck();
      this.hideTimer = setTimeout(() => {
        this.visible = false;
        this.cdr.markForCheck();
      }, 650);
    }, 1300);
  }

  ngOnDestroy(): void {
    if (this.startTimer) clearTimeout(this.startTimer);
    if (this.hideTimer) clearTimeout(this.hideTimer);
    globalThis.document?.documentElement.classList.remove('airship-boot-pending');
  }
}
