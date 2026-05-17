import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
  host: { class: 'media-gallery' },
})
export class GalleryComponent implements OnChanges {
  /** Gallery thumbnails (and main image when selected). */
  @Input() images: string[] = [];
  /** Shown when `images` is empty or as initial main before pick. */
  @Input() fallbackSrc = '';
  @Input() alt = 'Gallery';

  selectedIndex = 0;

  ngOnChanges(): void {
    this.selectedIndex = 0;
  }

  get hasThumbs(): boolean {
    return this.images.length > 1;
  }

  get mainSrc(): string {
    if (this.images.length > 0) {
      return this.images[this.selectedIndex] ?? this.images[0] ?? this.fallbackSrc;
    }
    return this.fallbackSrc;
  }

  select(index: number): void {
    if (index < 0 || index >= this.images.length) {
      return;
    }
    this.selectedIndex = index;
  }
}
