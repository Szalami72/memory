import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css', '../../../../shared/styles/menu-windows.css']
})
export class ProfileComponent {

  constructor(private authService: AuthService,
    private router: Router
  ) { }

  logout(): void {
    this.authService.logout();
  }

  backToStartPage(): void {
    this.router.navigate(['/home']);
  }
}
