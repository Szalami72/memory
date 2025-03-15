import { Component } from '@angular/core';
import { CommonModule} from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { RouterOutlet } from '@angular/router';
import firebase from 'firebase/compat/app';


import { MenuComponent } from '../menu/menu.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,
    HeaderComponent, MenuComponent, RouterOutlet],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

   
  constructor(private authService: AuthService) {
    }
  
  
    getUserEmail(user: firebase.User | null): string {
      return this.authService.getUserEmail(user) || 'Nincs email cím';
    }
}
