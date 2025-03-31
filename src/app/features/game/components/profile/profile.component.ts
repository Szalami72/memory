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
  progress = 0; // 0-100%-os progress érték
  pressTimer: any = null;
  pressStartTime: number = 0;
  holdDuration = 1000; // 1000 ms = 1 másodperc
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

  startPress(): void {
    this.pressStartTime = Date.now();
    this.progress = 0;
    // 50ms-es intervallummal frissítjük a progress értékét
    this.pressTimer = setInterval(() => {
      const elapsed = Date.now() - this.pressStartTime;
      this.progress = Math.min(100, (elapsed / this.holdDuration) * 100);
      if (elapsed >= this.holdDuration) {
        this.logout();
        console.log('Kilépés végrehajtva, navigálás a kezdőoldalra.');
        this.endPress();
      }
    }, 50);
  }

  endPress(): void {
    if (this.pressTimer) {
      clearInterval(this.pressTimer);
      this.pressTimer = null;
    }
    this.progress = 0;
  }
}
