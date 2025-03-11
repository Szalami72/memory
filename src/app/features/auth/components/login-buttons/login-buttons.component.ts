import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { catchError } from 'rxjs/operators'; // Importáld a catchError operátort
import { of, from } from 'rxjs'; // Importáld az of függvényt
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-buttons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-buttons.component.html',
  styleUrls: ['./login-buttons.component.css']
})
export class LoginButtonsComponent implements OnInit {

  loginError: string | null = null; // Változó a hibaüzenet tárolására

  constructor(public authService: AuthService) {
    
   } // Injektáld az AuthService-t

  ngOnInit(): void {
  }

loginWithGoogle(): void {
  this.loginError = null; // Töröld a korábbi hibaüzenetet
  from(this.authService.loginWithGoogle())
    .pipe(
      catchError(error => {
        this.loginError = 'Login error! Please try it later!'; // Állítsd be a hibaüzenetet
        console.error('Google Login Error:', error);
        return of(null); // Fontos, hogy Observable-t adj vissza a catchError-ban, pl. of(null)
      })
    )
    .subscribe(); // Fontos feliratkozni, hogy a Promise lefusson, bár nem várunk értéket
}

  loginWithFacebook(): void {
    this.loginError = null;
    from(this.authService.loginWithFacebook())
      .pipe(
        catchError(error => {
          this.loginError = 'Login error! Please try it later!';
          console.error('Facebook Login Error:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  loginAsGuest(): void {
    this.loginError = null;
    from(this.authService.loginAsGuest())
      .pipe(
        catchError(error => {
          this.loginError = 'Login error! Please try it later!';
          console.error('Guest Login Error:', error);
          return of(null);
        })
      )
      .subscribe();
  }
}