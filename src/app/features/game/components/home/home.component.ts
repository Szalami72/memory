import { Component } from '@angular/core';
import { CommonModule} from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';
import { MenuComponent } from '../menu/menu.component';
import { HeaderComponent } from '../header/header.component';
import { SectionComponent } from '../section/section.component';  

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ CommonModule,
     HeaderComponent, SectionComponent, MenuComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

   
  constructor(private authService: AuthService) {
    }
  
    logout(): void {
      this.authService.logout();
    }
  
    getUserEmail(user: firebase.User | null): string {
      return this.authService.getUserEmail(user) || 'Nincs email cím';
    }
}
