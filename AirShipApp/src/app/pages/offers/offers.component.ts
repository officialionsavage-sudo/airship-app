import { CommonModule } from '@angular/common';
import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { Offer } from '../../core/models/app.models';
import { OffersApiService } from '../../core/services/offers-api.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    PaginationComponent,
    TranslatePipe,
  ],
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.scss',
})
export class OffersComponent {
  readonly pageSize = 6;
  readonly skeletonItems = Array.from({ length: this.pageSize });

  loading = true;
  offers: Offer[] = [];
  paginatedOffers: Offer[] = [];
  currentPage = 1;
  totalPages = 1;
  pageNumbers: number[] = [1];

  errorLoadFailed = false;

  constructor(
    private readonly offersApi: OffersApiService,
    destroyRef: DestroyRef,
  ) {
    this.offersApi
      .getOffers()
      .pipe(
        catchError(() => {
          this.errorLoadFailed = true;
          return of([] as Offer[]);
        }),
        finalize(() => {
          this.loading = false;
        }),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe((offers) => {
        this.offers = offers ?? [];
        this.applyPagination();
      });
  }

  trackByOffer = (_: number, offer: Offer) => offer.id;

  applyPagination(): void {
    this.totalPages = Math.max(1, Math.ceil(this.offers.length / this.pageSize));
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.pageNumbers = Array.from({ length: this.totalPages }, (_, idx) => idx + 1);

    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedOffers = this.offers.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.applyPagination();
  }

  primaryImage(offer: Offer): string {
    return offer.images?.[0] ?? '';
  }
}
