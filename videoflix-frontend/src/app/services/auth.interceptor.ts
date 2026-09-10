import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Authentication interceptor for HTTP requests.
 *
 * This interceptor checks if a valid authentication token is stored in `localStorage`. If a token is found, 
 * it clones the request and adds the `Authorization` header to include the token before passing the request
 * to the next handler. If no token is found, the request is sent without modification.
 *
 * Additionally, the interceptor handles HTTP errors. If a `401 Unauthorized` error occurs, the user is redirected
 * to the login page using the `Router`.
 *
 * @param {HttpRequest<any>} req - The outgoing HTTP request.
 * @param {HttpHandler} next - The next interceptor or request handler in the chain.
 * 
 * @returns {Observable<HttpEvent<any>>} An observable that represents the HTTP event stream.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  if (token) {
    const colned = req.clone({
      setHeaders: { Authorization: `Token ${token}` },
    });
    return next(colned);
  }
  return next(req).pipe(
    catchError((err) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) {
          router.navigateByUrl('login');
        }
      }
      return throwError(() => {
        err;
      });
    })
  );
};
