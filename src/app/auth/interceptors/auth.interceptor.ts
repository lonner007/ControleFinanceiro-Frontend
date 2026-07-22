import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const publica = req.url.includes('/Auth/Login') || req.url.includes('/Auth/Registrar') || req.url.includes('/Auth/Refresh');
  if (publica) return next(req);

  const token = auth.getToken();
  const reqAuth = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(reqAuth).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        const r$ = auth.refresh();
        if (r$) return r$.pipe(
          switchMap(() => next(req.clone({ setHeaders: { Authorization: `Bearer ${auth.getToken()}` } }))),
          catchError(() => { auth.logout(); return throwError(() => err); })
        );
        auth.logout();
      }
      return throwError(() => err);
    })
  );
};
