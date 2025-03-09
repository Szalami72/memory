import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { switchMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.user$.pipe(
      take(1), // Egy alkalommal várjuk meg az állapotot
      switchMap(user => {
        if (user) {
          // Ha be van jelentkezve a felhasználó
          return of(true);
        } else {
          // Ha nincs bejelentkezve, átirányítjuk a login oldalra
          this.router.navigate(['/auth/login']);
          return of(false);
        }
      })
    );
  }
}
