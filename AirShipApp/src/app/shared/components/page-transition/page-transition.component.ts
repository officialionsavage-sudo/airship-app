import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-page-transition',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-transition.component.html',
  styleUrl: './page-transition.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTransitionComponent {
  phase: 'idle' | 'exit' | 'enter' = 'idle';
  private enterTimer?: ReturnType<typeof setTimeout>;
  private idleTimer?: ReturnType<typeof setTimeout>;

  constructor(router: Router, destroyRef: DestroyRef) {
    router.events
      .pipe(
        filter((event): event is NavigationStart | NavigationEnd => event instanceof NavigationStart || event instanceof NavigationEnd),
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((event) => {
        if (this.enterTimer) clearTimeout(this.enterTimer);
        if (this.idleTimer) clearTimeout(this.idleTimer);

        if (event instanceof NavigationStart) {
          this.phase = 'exit';
          return;
        }

        this.phase = 'enter';
        this.idleTimer = setTimeout(() => {
          this.phase = 'idle';
        }, 780);
      });

    destroyRef.onDestroy(() => {
      if (this.enterTimer) clearTimeout(this.enterTimer);
      if (this.idleTimer) clearTimeout(this.idleTimer);
    });
  }
}
