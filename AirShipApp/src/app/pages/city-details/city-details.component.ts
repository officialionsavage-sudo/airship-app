import { AsyncPipe, CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { BackgroundSceneService } from '../../core/services/background-scene.service';
import { CitiesApiService } from '../../core/services/cities-api.service';

@Component({
  selector: 'app-city-details',
  standalone: true,
  imports: [CommonModule, AsyncPipe, RouterLink],
  templateUrl: './city-details.component.html',
  styleUrl: './city-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CityDetailsComponent {
  readonly city$ = this.route.paramMap.pipe(switchMap((params) => this.api.getCityBySlug(params.get('citySlug') || '')));
  readonly routeDepth = this.backgroundScene.routeDepth;
  private readonly isBrowser: boolean;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: CitiesApiService,
    private readonly backgroundScene: BackgroundSceneService,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  updatePortalParallax(event: MouseEvent): void {
    if (!this.isBrowser || globalThis.matchMedia('(pointer: coarse)').matches) {
      return;
    }
    const card = event.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const ry = ((x / rect.width) - 0.5) * 9;
    const rx = -((y / rect.height) - 0.5) * 7;
    card.style.setProperty('--mx', `${x}px`);
    card.style.setProperty('--my', `${y}px`);
    card.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
    card.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
  }

  resetPortalParallax(event: MouseEvent): void {
    if (!this.isBrowser) {
      return;
    }
    const card = event.currentTarget as HTMLElement;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  }
}
