import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_LINKS } from '../../../core/constants/site.constants';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgFor, RouterLink, RouterLinkActive, TranslatePipe, LanguageSwitcherComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  readonly links = NAV_LINKS;
  menuOpen = false;
  trackByIndex = (index: number) => index;

  closeMenu(): void {
    this.menuOpen = false;
  }
}
