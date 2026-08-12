import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.checkSession().pipe(
    map((res) => (res.loggedIn ? true : router.createUrlTree(['/admin/login']))),
    catchError(() => of(router.createUrlTree(['/admin/login'])))
  );
};
