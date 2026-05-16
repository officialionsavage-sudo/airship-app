import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

function clearBootOverlay(): void {
  document.documentElement.classList.remove('airship-boot-pending');
}

/** Avoid infinite splash if bootstrap rejects or never settles (e.g. misconfigured hydration). */
const bootFallbackTimer = window.setTimeout(clearBootOverlay, 15000);

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    window.clearTimeout(bootFallbackTimer);
  })
  .catch((err) => {
    window.clearTimeout(bootFallbackTimer);
    clearBootOverlay();
    console.error(err);
  });
