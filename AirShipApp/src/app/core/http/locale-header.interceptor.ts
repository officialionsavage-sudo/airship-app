import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LocaleService } from '../services/locale.service';

export const localeHeaderInterceptor: HttpInterceptorFn = (req, next) => {
  const locale = inject(LocaleService).locale;
  return next(req.clone({ setHeaders: { 'Accept-Language': locale } }));
};
