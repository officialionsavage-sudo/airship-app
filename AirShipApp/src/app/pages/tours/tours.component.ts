import { CommonModule } from '@angular/common';
import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, distinctUntilChanged, finalize, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { Tour, CatalogListingFilter } from '../../core/models/app.models';
import { CitiesApiService } from '../../core/services/cities-api.service';
import { ToursApiService } from '../../core/services/tours-api.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-tours',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSkeletonComponent, EmptyStateComponent, PaginationComponent],
  templateUrl: './tours.component.html',
  styleUrl: './tours.component.scss',
})
export class ToursComponent {
  readonly pageSize = 6;
  readonly skeletonItems = Array.from({ length: this.pageSize });

  citySlug = '';
  cityName = 'City';
  loading = true;
  errorMessage = '';

  tourFilters: CatalogListingFilter[] = [];
  selectedFilterSlug = 'all';

  private tours: Tour[] = [];
  filteredTours: Tour[] = [];
  paginatedTours: Tour[] = [];

  currentPage = 1;
  totalPages = 1;
  pageNumbers: number[] = [1];
  private lastCitySlug = '';
  private readonly destroyRef: DestroyRef;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly toursApi: ToursApiService,
    private readonly citiesApi: CitiesApiService,
    destroyRef: DestroyRef,
  ) {
    this.destroyRef = destroyRef;
    this.route.paramMap
      .pipe(
        map((params) => params.get('citySlug') || ''),
        distinctUntilChanged(),
        tap((slug) => {
          this.lastCitySlug = slug;
          this.citySlug = slug;
          this.loading = true;
          this.errorMessage = '';
          this.selectedFilterSlug = 'all';
          this.currentPage = 1;
        }),
        switchMap((slug) => this.fetchTours(slug)),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe(({ city, tours, filters }) => {
        if (!city && this.lastCitySlug) {
          this.errorMessage = 'Could not load tours right now.';
        }
        this.cityName = city?.title ?? 'City';
        this.tours = tours;
        this.tourFilters = filters;
        this.applyFilters();
      });
  }

  get filterSelectOptions(): Array<{ slug: string; title: string }> {
    return [{ slug: 'all', title: 'All types' }, ...this.tourFilters.map((f) => ({ slug: f.slug, title: f.title }))];
  }

  trackBySlug = (_: number, tour: Tour) => tour.slug;

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  selectFilter(slug: string): void {
    this.selectedFilterSlug = slug;
    this.onFilterChange();
  }

  applyFilters(): void {
    this.filteredTours = this.tours.filter((tour) => {
      if (this.selectedFilterSlug === 'all') {
        return true;
      }
      return tour.catalogFilterSlugs?.includes(this.selectedFilterSlug) ?? false;
    });

    this.totalPages = Math.max(1, Math.ceil(this.filteredTours.length / this.pageSize));
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.pageNumbers = Array.from({ length: this.totalPages }, (_, index) => index + 1);

    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedTours = this.filteredTours.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }

  displayTourType(tour: Tour): string {
    return this.toursApi.formatTourKind(tour.type);
  }

  retryLoad(): void {
    if (!this.lastCitySlug) {
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.fetchTours(this.lastCitySlug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ city, tours, filters }) => {
        if (!city) {
          this.errorMessage = 'Could not load tours right now.';
        }
        this.cityName = city?.title ?? 'City';
        this.tours = tours;
        this.tourFilters = filters;
        this.applyFilters();
      });
  }

  private fetchTours(slug: string) {
    return forkJoin({
      city: this.citiesApi.getCityBySlug(slug),
      tours: this.toursApi.getToursByCity(slug),
      filters: this.toursApi.getTourTypeFilters(slug),
    }).pipe(
      catchError(() =>
        of({
          city: undefined,
          tours: [],
          filters: [] as CatalogListingFilter[],
        }),
      ),
      finalize(() => {
        this.loading = false;
      }),
    );
  }
}
