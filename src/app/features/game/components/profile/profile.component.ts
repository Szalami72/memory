import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { MusicService } from '../../services/music.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css', '../../../../shared/styles/menu-windows.css']
})
export class ProfileComponent {

  constructor(private authService: AuthService,
    private router: Router, private musicService: MusicService
    
  ) { }

  logout(): void {
    this.musicService.stopMusic();
    this.authService.logout();
  }

  backToStartPage(): void {
    this.router.navigate(['/home']);
  }
}
