import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const adminGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  if (!authService.isAuthenticated()) {
    await authService.init();
  }

  if (authService.isAdmin()) {
    return true;
  }

  notificationService.warning(
    'Cet écran nécessite les droits ADMINISTRATEUR. Vous avez été redirigé vers la consultation.',
    'Accès restreint'
  );
  router.navigate(['/users']);
  return false;
};
