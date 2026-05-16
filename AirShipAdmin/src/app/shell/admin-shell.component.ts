import { isPlatformBrowser, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AdminAuthService } from '../core/admin-auth.service';
import { AdminConfirmHostComponent } from '../shared/admin-confirm/admin-confirm-host.component';
import { AdminNoticeBannerComponent } from '../shared/admin-notice/admin-notice-banner.component';

/** Matches `admin-shell.component.scss` mobile breakpoint. */
const MOBILE_NAV_MQ = '(max-width: 860px)';

export type AdminNavLink = { kind: 'link'; label: string; path: string };

export type AdminNavGroup = {
  kind: 'group';
  id: string;
  label: string;
  children: { label: string; path: string }[];
};

export type AdminNavEntry = AdminNavLink | AdminNavGroup;

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgFor,
    NgIf,
    AdminConfirmHostComponent,
    AdminNoticeBannerComponent,
  ],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.scss',
})
export class AdminShellComponent implements OnInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);

  readonly nav: AdminNavEntry[] = [
    { kind: 'link', label: 'Dashboard', path: '/dashboard' },
    { kind: 'link', label: 'Site content', path: '/cms/site-content' },
    { kind: 'link', label: 'Site settings', path: '/cms/site-settings' },
    { kind: 'link', label: 'Reviews', path: '/inbound/reviews' },
    {
      kind: 'group',
      id: 'requests',
      label: 'Requests',
      children: [
        { label: 'Booking requests', path: '/inbound/bookings' },
        { label: 'Contact requests', path: '/inbound/contacts' },
      ],
    },
    { kind: 'link', label: 'Cities', path: '/catalog/cities' },
    {
      kind: 'group',
      id: 'real-estate',
      label: 'Real estate management',
      children: [
        { label: 'Real states filters', path: '/catalog/real-estate-filters' },
        { label: 'Real states list', path: '/catalog/projects' },
      ],
    },
    {
      kind: 'group',
      id: 'tours',
      label: 'Tours management',
      children: [
        { label: 'Tours filters', path: '/catalog/tour-filters' },
        { label: 'Tours list', path: '/catalog/tours' },
      ],
    },
    { kind: 'link', label: 'Offers', path: '/catalog/offers' },
    { kind: 'link', label: 'Vehicle types', path: '/catalog/vehicle-types' },
    { kind: 'link', label: 'Transfer cars', path: '/catalog/cars' },
  ];

  /** Collapsible group ids — expanded when toggled or when a child route is active. */
  expandedGroups = new Set<string>();

  menuCollapsed = false;

  /** Overlay drawer mode — sidebar floats over content; main stays full width. */
  isMobileLayout = false;

  private mobileMq?: MediaQueryList;
  private onMobileMqChange?: (e: MediaQueryListEvent) => void;

  constructor(
    readonly auth: AdminAuthService,
    private readonly router: Router,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

  ngOnInit(): void {
    this.syncExpandedGroupsFromUrl(this.router.url);
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((e) => this.syncExpandedGroupsFromUrl(e.urlAfterRedirects));

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.mobileMq = window.matchMedia(MOBILE_NAV_MQ);
    this.syncLayoutFromMq(this.mobileMq.matches);
    this.onMobileMqChange = (e: MediaQueryListEvent) => this.syncLayoutFromMq(e.matches);
    this.mobileMq.addEventListener('change', this.onMobileMqChange);
  }

  isLink(entry: AdminNavEntry): entry is AdminNavLink {
    return entry.kind === 'link';
  }

  isGroup(entry: AdminNavEntry): entry is AdminNavGroup {
    return entry.kind === 'group';
  }

  isGroupExpanded(group: AdminNavGroup): boolean {
    return this.expandedGroups.has(group.id);
  }

  isGroupActive(group: AdminNavGroup): boolean {
    return group.children.some((child) => this.router.isActive(child.path, false));
  }

  toggleGroup(group: AdminNavGroup, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const next = new Set(this.expandedGroups);
    if (next.has(group.id)) {
      next.delete(group.id);
    } else {
      next.add(group.id);
    }
    this.expandedGroups = next;
  }

  private syncExpandedGroupsFromUrl(url: string): void {
    const next = new Set(this.expandedGroups);
    for (const entry of this.nav) {
      if (entry.kind !== 'group') {
        continue;
      }
      const childActive = entry.children.some(
        (child) => url === child.path || url.startsWith(`${child.path}/`),
      );
      if (childActive) {
        next.add(entry.id);
      }
    }
    this.expandedGroups = next;
  }

  ngOnDestroy(): void {
    if (this.mobileMq && this.onMobileMqChange) {
      this.mobileMq.removeEventListener('change', this.onMobileMqChange);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isMobileLayout && !this.menuCollapsed) {
      this.menuCollapsed = true;
    }
  }

  toggleMenu(): void {
    this.menuCollapsed = !this.menuCollapsed;
  }

  closeDrawerAfterNav(): void {
    if (this.isMobileLayout) {
      this.menuCollapsed = true;
    }
  }

  private syncLayoutFromMq(matchesMobile: boolean): void {
    const wasMobile = this.isMobileLayout;
    this.isMobileLayout = matchesMobile;
    if (matchesMobile && !wasMobile) {
      this.menuCollapsed = true;
    } else if (!matchesMobile && wasMobile) {
      this.menuCollapsed = false;
    }
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
