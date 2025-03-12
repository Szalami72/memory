import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { catchError } from 'rxjs/operators';
import { of, from } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MusicService } from '../../../game/services/music.service';// Igazítsd az elérési utat
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-login-buttons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-buttons.component.html',
  styleUrls: ['./login-buttons.component.css']
})
export class LoginButtonsComponent implements OnInit {

  loginError: string | null = null;

  constructor(
    public authService: AuthService,
    private musicService: MusicService
  ) { }

  ngOnInit(): void { }

  // Segéd metódus, amely ellenőrzi a "musicSetting" értékét, és ha engedélyezett, elindítja a zenét.
  private async checkMusicSettingAndPlay(): Promise<void> {
    const { value } = await Preferences.get({ key: 'musicSetting' });
    const isMusicOn = value !== null ? JSON.parse(value) : true;
    if (isMusicOn) {
      this.musicService.playMusic();
    }
  }

  async loginWithGoogle(): Promise<void> {
    await this.checkMusicSettingAndPlay();
    this.loginError = null;
    from(this.authService.loginWithGoogle())
      .pipe(
        catchError(error => {
          this.loginError = 'Login error! Please try it later!';
          console.error('Google Login Error:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  async loginWithFacebook(): Promise<void> {
    await this.checkMusicSettingAndPlay();
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

  async loginAsGuest(): Promise<void> {
    await this.checkMusicSettingAndPlay();
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
