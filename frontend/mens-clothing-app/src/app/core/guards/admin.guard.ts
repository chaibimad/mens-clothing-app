import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { switchMap, map, take, of } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const userService = inject(UserService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    switchMap(user => {
      if (!user) {
        router.navigate(['/login']);
        return of(false);
      }
      
      return userService.getUserProfile(user.uid).pipe(
        take(1),
        map(profile => {
          if (profile && profile.role === 'admin') {
            return true;
          } else {
            // Block standard customer and redirect to home
            router.navigate(['/']);
            return false;
          }
        })
      );
    })
  );
};
