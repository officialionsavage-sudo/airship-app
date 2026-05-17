import { CommonModule } from '@angular/common';
import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { Project } from '../../core/models/app.models';
import { ProjectsApiService } from '../../core/services/projects-api.service';
import { GalleryComponent } from '../../shared/components/gallery/gallery.component';

@Component({
  selector: 'app-resort-details',
  standalone: true,
  imports: [CommonModule, RouterLink, GalleryComponent],
  templateUrl: './resort-details.component.html',
  styleUrl: './resort-details.component.scss',
})
export class ResortDetailsComponent {
  project?: Project;
  loading = true;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ProjectsApiService,
    destroyRef: DestroyRef
  ) {
    this.route.paramMap
      .pipe(
        switchMap((params) => this.api.getProjectBySlug(params.get('citySlug') || '', params.get('projectSlug') || '')),
        takeUntilDestroyed(destroyRef)
      )
      .subscribe((project) => {
        this.project = project;
        this.loading = false;
      });
  }

  hasListItems(items: string[] | undefined | null): boolean {
    return (items ?? []).some((s) => s.trim().length > 0);
  }

  openProjectLocation(): void {
    if (!this.project) {
      return;
    }
    const city = this.project.citySlug.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
    const query = encodeURIComponent(`${this.project.locationName}, ${city}, Egypt`);
    globalThis.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer');
  }
}
