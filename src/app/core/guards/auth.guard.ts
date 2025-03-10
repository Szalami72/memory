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
      take(1),
      switchMap(user => {
        const storedUser = localStorage.getItem('user'); // 🔴 Ellenőrizzük a localStorage-t
        if (user || storedUser) {
          return of(true);
        } else {
          this.router.navigate(['/auth/login']);
          return of(false);
        }
      })
    );
  }
  
}
