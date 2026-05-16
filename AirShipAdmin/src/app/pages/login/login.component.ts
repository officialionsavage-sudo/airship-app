import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../core/admin-auth.service';
import { apiUrl } from '../../core/api-url';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf],
  template: `
    <div class="login">
      <form class="card" (ngSubmit)="submit()">
        <h1>AirShip Admin</h1>
        <p class="muted">
          Sign in with <strong>ADMIN_USERNAME</strong> and <strong>ADMIN_PASSWORD</strong> from your server
          <code>.env</code>. Wrong credentials are rejected by the API.
        </p>
        <label class="field">
          <span>Username</span>
          <input
            name="username"
            [(ngModel)]="usernameInput"
            type="text"
            autocomplete="username"
            required
            placeholder="Admin username"
          />
        </label>
        <label class="field">
          <span>Password</span>
          <input
            name="password"
            [(ngModel)]="passwordInput"
            type="password"
            autocomplete="current-password"
            required
            placeholder="Admin password"
          />
        </label>
        <p class="err" *ngIf="error">{{ error }}</p>
        <button type="submit" class="btn btn-primary" [disabled]="checking">
          {{ checking ? 'Checking…' : 'Sign in' }}
        </button>
      </form>
    </div>
  `,
  styles: [
    `
      .login {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
      }
      .card {
        width: 100%;
        max-width: 400px;
        padding: 1.75rem;
        border-radius: 16px;
        border: 1px solid var(--admin-border);
        background: var(--admin-surface);
      }
      h1 {
        margin: 0 0 0.5rem;
        font-size: 1.35rem;
      }
      .muted {
        color: var(--admin-muted);
        font-size: 0.85rem;
        margin: 0 0 1rem;
        line-height: 1.45;
      }
      .muted code {
        font-size: 0.78em;
        padding: 0.1em 0.35em;
        border-radius: 4px;
        background: rgba(148, 163, 184, 0.12);
      }
      .field {
        display: block;
        margin-top: 0.75rem;
      }
      .field span {
        display: block;
        margin-bottom: 0.35rem;
        font-size: 0.85rem;
        color: var(--admin-muted);
      }
      input {
        width: 100%;
        padding: 0.55rem 0.65rem;
        border-radius: 8px;
        border: 1px solid var(--admin-border);
        background: #020617;
        color: var(--admin-text);
      }
      .err {
        color: var(--admin-danger);
        font-size: 0.85rem;
        margin-top: 0.75rem;
      }
      button {
        margin-top: 0.75rem;
        width: 100%;
        justify-content: center;
      }
    `,
  ],
})
export class LoginComponent {
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  usernameInput = 'admin';
  passwordInput = 'admin123';
  error = '';
  checking = false;

  submit(): void {
    this.error = '';
    const username = this.usernameInput.trim();
    const password = this.passwordInput.trim();
    if (!username || !password) {
      this.error = 'Please enter username and password.';
      return;
    }
    this.checking = true;
    this.auth.setCredentials(username, password);
    this.http
      .get(apiUrl('/api/admin/site-content'), { params: { page: '1', pageSize: '1' } })
      .subscribe({
        next: () => {
          this.checking = false;
          void this.router.navigateByUrl('/dashboard');
        },
        error: (err: { status?: number }) => {
          this.checking = false;
          this.auth.logout();
          if (err.status === 401) {
            this.error = 'Wrong username or password.';
          } else if (err.status === 503) {
            this.error =
              'Admin API is not configured on the server (set ADMIN_PASSWORD or ADMIN_API_KEY in .env, restart the API). For this login screen you also need ADMIN_USERNAME.';
          } else {
            this.error =
              'Could not reach the admin API. Run the backend, use `ng serve` with proxy, and ensure the URL in environment matches your deployment.';
          }
        },
      });
  }
}
