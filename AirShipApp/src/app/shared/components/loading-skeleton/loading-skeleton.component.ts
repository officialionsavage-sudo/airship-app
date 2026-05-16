import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-skeleton.component.html',
  styleUrl: './loading-skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSkeletonComponent {
  @Input() count = 6;
  @Input() minWidth = '280px';
  get items(): number[] {
    return Array.from({ length: this.count }, (_, idx) => idx);
  }
  trackByIdx = (idx: number) => idx;
}
