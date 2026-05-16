import { CommonModule } from '@angular/common';
import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, distinctUntilChanged, finalize, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { CatalogListingFilter, Project } from '../../core/models/app.models';
import { CitiesApiService } from '../../core/services/cities-api.service';
import { ProjectsApiService } from '../../core/services/projects-api.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-real-estate-projects',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSkeletonComponent, EmptyStateComponent, PaginationComponent],
  templateUrl: './real-estate-projects.component.html',
  styleUrl: './real-estate-projects.component.scss',
})
export class RealEstateProjectsComponent {
  readonly pageSize = 6;
  readonly skeletonItems = Array.from({ length: this.pageSize });

  citySlug = '';
  cityName = 'City';
  loading = true;
  errorMessage = '';

  locationFilters: CatalogListingFilter[] = [];

  selectedLocation = 'all';

  currentPage = 1;
  totalPages = 1;
  pageNumbers: number[] = [1];

  private projects: Project[] = [];
  filteredProjects: Project[] = [];
  paginatedProjects: Project[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly projectsApi: ProjectsApiService,
    private readonly citiesApi: CitiesApiService,
    destroyRef: DestroyRef
  ) {
    this.route.paramMap
      .pipe(
        map((params) => params.get('citySlug') || ''),
        distinctUntilChanged(),
        tap((slug) => {
          this.citySlug = slug;
          this.loading = true;
          this.errorMessage = '';
          this.currentPage = 1;
          this.selectedLocation = 'all';
        }),
        switchMap((slug) =>
          forkJoin({
            city: this.citiesApi.getCityBySlug(slug),
            projects: this.projectsApi.getProjectsByCity(slug),
            locations: this.projectsApi.getLocationFilters(slug),
          }).pipe(
            catchError(() =>
              of({
                city: undefined,
                projects: [],
                locations: [],
              })
            ),
            finalize(() => {
              this.loading = false;
            })
          )
        ),
        takeUntilDestroyed(destroyRef)
      )
      .subscribe(({ city, projects, locations }) => {
        if (!city) {
          this.errorMessage = 'Could not load projects right now.';
        }
        this.cityName = city?.title ?? 'City';
        this.projects = projects;
        this.locationFilters = locations;
        this.applyFilters();
      });
  }

  trackBySlug = (_: number, project: Project) => project.slug;

  applyFilters(): void {
    this.filteredProjects = this.projects.filter((project) => {
      const locationOk =
        this.selectedLocation === 'all' ||
        (project.catalogFilterSlugs?.length
          ? project.catalogFilterSlugs.includes(this.selectedLocation)
          : project.locationSlug === this.selectedLocation);
      return locationOk;
    });

    this.totalPages = Math.max(1, Math.ceil(this.filteredProjects.length / this.pageSize));
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.pageNumbers = Array.from({ length: this.totalPages }, (_, index) => index + 1);

    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedProjects = this.filteredProjects.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  selectLocation(slug: string): void {
    this.selectedLocation = slug;
    this.onFilterChange();
  }

  formatStatus(status: string): string {
    return status.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}
