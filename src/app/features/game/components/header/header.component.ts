import { Component } from '@angular/core';
import { CommonModule, AsyncPipe, NgIf } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,
    AsyncPipe, NgIf,],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  user$: Observable<firebase.User | null>;
     
    constructor(private authService: AuthService) {
        this.user$ = this.authService.user$;
      }
}
