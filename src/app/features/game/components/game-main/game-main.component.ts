import { Component } from '@angular/core';
import { CommonModule, AsyncPipe, NgIf } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-game-main',
  standalone: true,
  imports: [ CommonModule, AsyncPipe, NgIf ],
  templateUrl: './game-main.component.html',
  styleUrl: './game-main.component.css'
})
export class GameMainComponent {

  user$: Observable<firebase.User | null>;  

  constructor(private authService: AuthService) {
    this.user$ = this.authService.user$;
  }

  logout(): void {
    this.authService.logout();
  }

  getUserEmail(user: firebase.User | null): string {
    return this.authService.getUserEmail(user) || 'Nincs email cím';
  }

}
