import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  // Exclure les requêtes statiques ou hors API
  if (!req.url.includes('/api')) {
    return next(req);
  }

  return from(authService.getToken()).pipe(
    switchMap(token => {
      let authReq = req;
      if (token) {
        authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }

      return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            notificationService.warning('Votre session a expiré. Veuillez vous reconnecter.', 'Session expirée');
            authService.logout();
            router.navigate(['/login']);
          } else if (error.status === 403) {
            notificationService.error(
              'Action non autorisée. Votre rôle actuel ne vous confère pas ces privilèges.',
              'Accès refusé (HTTP 403)'
            );
          } else if (error.status === 409) {
            const serverMsg = error.error?.message || 'Un utilisateur avec ces coordonnées existe déjà.';
            notificationService.error(serverMsg, 'Conflit de données (HTTP 409)');
          } else if (error.status >= 500) {
            notificationService.error(
              error.error?.message || 'Une erreur inattendue est survenue sur le serveur.',
              'Erreur serveur (HTTP 500)'
            );
          }

          return throwError(() => error);
        })
      );
    })
  );
}
