import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ADMIN_MSG, adminApiErrorMessage } from '../../core/admin-messages';
import type { AdminPaginated } from '../../core/admin-paginated';
import { apiUrl } from '../../core/api-url';
import { AdminConfirmService } from '../../shared/admin-confirm/admin-confirm.service';
import { AdminNoticeService } from '../../shared/admin-notice/admin-notice.service';
import { AdminImageFieldComponent } from '../../shared/admin-image-field/admin-image-field.component';
import { AdminModalComponent } from '../../shared/admin-modal/admin-modal.component';
import { AdminPaginationBarComponent } from '../../shared/admin-pagination-bar/admin-pagination-bar.component';
import { AdminFieldHintComponent } from '../../shared/admin-field-hint/admin-field-hint.component';
import { CAR_HINTS } from '../../shared/admin-field-hint/admin-field-hints.constants';
import { HelpPanelComponent } from '../../shared/help-panel/help-panel.component';

type CarListRow = {
  id: string;
  slug: string;
  name: string;
  type: string;
  passengers: number;
  luggage: number;
  pricePerDay: number;
  sortOrder: number;
};

type CarRow = CarListRow & { imageBase64: string };

@Component({
  selector: 'app-cars-page',
  standalone: true,
  imports: [
    FormsModule,
    NgFor,
    NgIf,
    HelpPanelComponent,
    AdminImageFieldComponent,
    AdminModalComponent,
    AdminPaginationBarComponent,
    AdminFieldHintComponent,
  ],
  template: `
    <h1 class="page-title">Transfer vehicles</h1>
    <p class="page-intro">
      Cars and vans guests can book for airport transfers and rentals on the website. Lower sort numbers appear first in the list.
    </p>
    <app-help-panel title="Photos">
      Upload an image or paste a link — your web team can help if the picture doesn’t appear.
    </app-help-panel>
    <div class="admin-toolbar">
      <button type="button" class="btn btn-primary" (click)="openNew()">Add a vehicle</button>
    </div>
    <p *ngIf="listLoaded && cars.length === 0" class="admin-empty-state">
      No vehicles yet. Click <strong>Add a vehicle</strong> to show options on the transfer page.
    </p>
    <div class="admin-table-wrap-cards" *ngIf="listLoaded && cars.length > 0">
      <div class="admin-scroll">
        <table class="admin-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Type</th>
              <th scope="col">Passengers</th>
              <th scope="col">Luggage</th>
              <th scope="col">Price / day (EGP)</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of cars">
              <td>{{ c.name }}</td>
              <td>{{ c.type }}</td>
              <td>{{ c.passengers }}</td>
              <td>{{ c.luggage }}</td>
              <td>{{ c.pricePerDay }}</td>
              <td><button type="button" class="btn" (click)="pick(c)">Edit</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="admin-cards">
        <div class="admin-card" *ngFor="let c of cars">
          <strong>{{ c.name }}</strong>
          <div>{{ c.type }} · {{ c.passengers }} pax · {{ c.luggage }} bags · {{ c.pricePerDay }} EGP/day</div>
          <button type="button" class="btn" (click)="pick(c)">Edit</button>
        </div>
      </div>
    </div>
    <app-admin-pagination-bar
      itemLabel="vehicles"
      [page]="page"
      [pageSize]="pageSize"
      [total]="total"
      (pageChange)="onPage($event)"
    />

    <app-admin-modal [(open)]="modalOpen" [title]="picked ? 'Edit vehicle' : 'Add a vehicle'">
      <div class="modal-scroll-form">
        <div class="field">
          <label class="field-label-with-hint">
            Link ending (internal)
            <app-admin-field-hint [text]="hint.slug" />
          </label>
          <input [(ngModel)]="f.slug" placeholder="e.g. mercedes-vito" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Name
            <app-admin-field-hint [text]="hint.name" />
          </label>
          <input [(ngModel)]="f.name" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Type
            <app-admin-field-hint [text]="hint.type" />
          </label>
          <input [(ngModel)]="f.type" placeholder="Sedan, SUV…" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Passengers
            <app-admin-field-hint [text]="hint.passengers" />
          </label>
          <input type="number" [(ngModel)]="f.passengers" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Luggage
            <app-admin-field-hint [text]="hint.luggage" />
          </label>
          <input type="number" [(ngModel)]="f.luggage" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Price per day (EGP)
            <app-admin-field-hint [text]="hint.pricePerDay" />
          </label>
          <input type="number" [(ngModel)]="f.pricePerDay" />
        </div>
        <div class="field">
          <label class="field-label-with-hint">
            Sort order
            <app-admin-field-hint [text]="hint.sortOrder" />
          </label>
          <input type="number" [(ngModel)]="f.sortOrder" />
        </div>
        <app-admin-image-field
          [(ngModel)]="f.imageBase64"
          label="Vehicle image"
          [fieldHint]="hint.image"
        />
        <p class="err" *ngIf="error">{{ error }}</p>
        <div class="admin-modal-actions">
          <button type="button" class="btn btn-primary" (click)="save()">{{ picked ? 'Save changes' : 'Add vehicle' }}</button>
          <button type="button" class="btn" (click)="modalOpen = false">Close</button>
          <button type="button" class="btn btn-danger" *ngIf="picked" (click)="remove()">Delete vehicle</button>
        </div>
      </div>
    </app-admin-modal>
  `,
  styles: [],
})
export class CarsPageComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly confirm = inject(AdminConfirmService);
  private readonly notice = inject(AdminNoticeService);

  readonly hint = CAR_HINTS;
  readonly pageSize = 20;
  page = 1;
  total = 0;
  cars: CarListRow[] = [];
  listLoaded = false;
  picked: CarRow | null = null;
  f = this.empty();
  error = '';
  modalOpen = false;

  ngOnInit(): void {
    this.reload();
  }

  onPage(p: number): void {
    this.page = p;
    this.reload();
  }

  empty() {
    return {
      slug: '',
      name: '',
      type: '',
      passengers: 4,
      luggage: 2,
      pricePerDay: 0,
      sortOrder: 0,
      imageBase64: '',
    };
  }

  reload(): void {
    this.http
      .get<AdminPaginated<CarListRow>>(apiUrl('/api/admin/cars'), {
        params: { page: this.page, pageSize: this.pageSize },
      })
      .subscribe({
        next: (r) => {
          this.listLoaded = true;
          this.cars = r.items;
          this.total = r.total;
          if (r.items.length === 0 && r.total > 0 && this.page > 1) {
            this.page--;
            this.reload();
          }
        },
        error: () => {
          this.listLoaded = true;
          this.notice.error(ADMIN_MSG.loadList);
        },
      });
  }

  openNew(): void {
    this.picked = null;
    this.f = this.empty();
    this.error = '';
    this.modalOpen = true;
  }

  pick(c: CarListRow): void {
    this.error = '';
    this.http.get<CarRow>(apiUrl(`/api/admin/cars/${c.id}`)).subscribe({
      next: (full) => {
        this.picked = full;
        this.f = {
          slug: full.slug,
          name: full.name,
          type: full.type,
          passengers: full.passengers,
          luggage: full.luggage,
          pricePerDay: full.pricePerDay,
          sortOrder: full.sortOrder,
          imageBase64: full.imageBase64,
        };
        this.modalOpen = true;
      },
      error: () => {
        this.notice.error(ADMIN_MSG.loadList);
      },
    });
  }

  save(): void {
    void this.saveAsync();
  }

  private async saveAsync(): Promise<void> {
    const ok = await this.confirm.open({
      title: this.picked ? 'Save vehicle?' : 'Add vehicle?',
      message: this.picked ? 'Updates appear on the transfer booking page.' : 'The vehicle will show in the transfer list.',
      confirmLabel: this.picked ? 'Save changes' : 'Add vehicle',
    });
    if (!ok) {
      return;
    }
    const body = {
      slug: this.f.slug.trim(),
      name: this.f.name.trim(),
      type: this.f.type.trim(),
      passengers: Number(this.f.passengers),
      luggage: Number(this.f.luggage),
      pricePerDay: Number(this.f.pricePerDay),
      sortOrder: Number(this.f.sortOrder),
      imageBase64: this.f.imageBase64,
    };
    this.error = '';
    const req = this.picked
      ? this.http.put(apiUrl(`/api/admin/cars/${this.picked.id}`), body)
      : this.http.post(apiUrl('/api/admin/cars'), body);
    req.subscribe({
      next: () => {
        const wasEdit = !!this.picked;
        this.modalOpen = false;
        this.picked = null;
        this.f = this.empty();
        this.notice.success(wasEdit ? 'Vehicle saved.' : 'Vehicle added.');
        this.reload();
      },
      error: (e) => {
        this.error = adminApiErrorMessage(e, ADMIN_MSG.save);
      },
    });
  }

  remove(): void {
    void this.removeAsync();
  }

  private async removeAsync(): Promise<void> {
    if (!this.picked) {
      return;
    }
    const ok = await this.confirm.open({
      title: 'Remove this vehicle?',
      message: 'It will no longer appear as an option for transfers.',
      confirmLabel: 'Yes, remove',
    });
    if (!ok) {
      return;
    }
    this.http.delete(apiUrl(`/api/admin/cars/${this.picked.id}`)).subscribe({
      next: () => {
        this.modalOpen = false;
        this.picked = null;
        this.f = this.empty();
        this.notice.success('Vehicle removed.');
        this.reload();
      },
      error: (e) => {
        this.error = adminApiErrorMessage(e, ADMIN_MSG.delete);
      },
    });
  }
}
