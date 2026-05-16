import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const fifteenMinutesMs = 15 * 60 * 1000;

/** Baseline headers; CSP disabled so Swagger UI scripts run locally—tighten in prod if serving HTML from this process. */
export function helmetMiddleware(): ReturnType<typeof helmet> {
  return helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });
}

/** Applied to all `/api` traffic (GET-heavy catalog). */
export const apiGeneralLimiter = rateLimit({
  windowMs: fifteenMinutesMs,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

/** Stricter cap for booking/contact/review POST bodies (abuse resistance). */
export const inquiryPostLimiter = rateLimit({
  windowMs: fifteenMinutesMs,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Try again later.' },
});
