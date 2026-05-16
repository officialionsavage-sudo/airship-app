import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

interface BreadcrumbItem {
  label: string;
  path: string;
  clickable: boolean;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent {
  readonly items$ = this.router.events.pipe(
    startWith(new NavigationEnd(0, this.router.url, this.router.url)),
    filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    map((event) => this.buildBreadcrumbItems(event.urlAfterRedirects))
  );

  constructor(private readonly router: Router) {}

  private buildBreadcrumbItems(url: string): BreadcrumbItem[] {
    const segments = url.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [{ label: 'Home', path: '/', clickable: url !== '/' }];

    let path = '';
    segments.forEach((segment, index) => {
      path += `/${segment}`;
      items.push({
        label: segment.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
        path,
        clickable: index !== segments.length - 1,
      });
    });

    return items;
  }

  trackByPath = (_: number, item: BreadcrumbItem) => item.path;
}
