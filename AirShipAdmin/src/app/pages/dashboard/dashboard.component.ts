import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HelpPanelComponent } from '../../shared/help-panel/help-panel.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, NgFor, HelpPanelComponent],
  template: `
    <h1 class="page-title">Dashboard</h1>
    <p class="page-intro">
      Welcome. Use the sections below to update what visitors see on the website, manage destinations and listings, and read messages from customers.
      Everything saves to the live site when you click Save — take care when deleting items.
    </p>
    <app-help-panel title="Quick guide for editors">
      <p>
        <strong>Website text &amp; home page:</strong> open <strong>Site content</strong> for the marketing home page, and <strong>Site settings</strong> for phone number,
        WhatsApp, email, address, and opening hours (shown in the footer and contact areas).
      </p>
      <p>
        <strong>Transfer cars:</strong> edit vehicles under <strong>Cars</strong> — they appear in the airport transfer booking flow on the public site.
      </p>
      <p>
        <strong>Customer messages:</strong> <strong>Reviews</strong>, <strong>Booking inquiries</strong>, and <strong>Contact inquiries</strong> are incoming messages from the website.
        You can approve reviews; bookings and contacts are read-only logs to follow up outside this panel.
      </p>
      <p>
        <strong>List filters:</strong> <strong>Real estate filters</strong> and <strong>Tour filters</strong> control the dropdown filters on destination listing pages — they are separate from city pages.
      </p>
    </app-help-panel>
    <ul class="tiles">
      <li *ngFor="let t of tiles">
        <a [routerLink]="t.path">{{ t.label }}</a>
        <span>{{ t.hint }}</span>
      </li>
    </ul>
  `,
  styles: [
    `
      .tiles {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 0.75rem;
      }
      .tiles li {
        border: 1px solid var(--admin-border);
        border-radius: 12px;
        padding: 1rem;
        background: var(--admin-surface);
      }
      .tiles a {
        font-weight: 700;
        text-decoration: none;
        display: block;
        margin-bottom: 0.35rem;
        color: var(--admin-accent);
      }
      .tiles a:hover {
        text-decoration: underline;
      }
      .tiles span {
        font-size: 0.82rem;
        color: var(--admin-muted);
        line-height: 1.4;
      }
    `,
  ],
})
export class DashboardComponent {
  readonly tiles = [
    { label: 'Site content', path: '/cms/site-content', hint: 'Home page wording and other structured content keys.' },
    { label: 'Site settings', path: '/cms/site-settings', hint: 'Contact phone, WhatsApp, email, address, hours.' },
    { label: 'Reviews', path: '/inbound/reviews', hint: 'Approve visitor reviews before they appear on the home page.' },
    { label: 'Booking inquiries', path: '/inbound/bookings', hint: 'Tour and unit booking requests (view only).' },
    { label: 'Contact inquiries', path: '/inbound/contacts', hint: 'Messages from the contact form (view only).' },
    { label: 'Cities', path: '/catalog/cities', hint: 'Destinations: names, photos, and landing tiles.' },
    { label: 'Real estate filters', path: '/catalog/real-estate-filters', hint: 'City-scoped tags for the projects listing; assign on each project.' },
    { label: 'Tour filters', path: '/catalog/tour-filters', hint: 'City-scoped buckets for the tours listing; assign when editing a tour.' },
    { label: 'Real states', path: '/catalog/projects', hint: 'Property developments and units.' },
    { label: 'Tours', path: '/catalog/tours', hint: 'Experiences, prices, and photos.' },
    { label: 'Offers', path: '/catalog/offers', hint: 'Standalone promo tiles (images, text, prices).' },
    { label: 'Transfer cars', path: '/catalog/cars', hint: 'Vehicles for transfers and rentals.' },
  ];
}
