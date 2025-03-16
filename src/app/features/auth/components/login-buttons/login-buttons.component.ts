import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { catchError, tap } from 'rxjs/operators';
import { of, from } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MusicService } from '../../../game/services/music.service';
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

  private async checkMusicSettingAndPlay(): Promise<void> {
    const { value } = await Preferences.get({ key: 'musicSetting' });
    const isMusicOn = value !== null ? JSON.parse(value) : true;
    if (isMusicOn) {
      this.musicService.playMusic();
    }
  }

  private saveUserIdToLocalStorage(userId: string): void {
    localStorage.setItem('userId', userId); // Elmentjük a localStorage-be
  }

  loginWithGoogle(): void {
    this.loginError = null;
    from(this.authService.loginWithGoogle())
      .pipe(
        tap(() => {
          const userId = this.authService.getUserId(); // Ez a metódus most a userId-t adja vissza
          if (userId) {
            this.saveUserIdToLocalStorage(userId); // Elmentjük
          }
          this.checkMusicSettingAndPlay();
        }),
        catchError(error => {
          this.loginError = 'Login error! Please try it later!';
          console.error('Google Login Error:', error);
          return of(null);
        })
      )
      .subscribe();
  }
  
  loginWithFacebook(): void {
    this.loginError = null;
    from(this.authService.loginWithFacebook())
      .pipe(
        tap(() => {
          const userId = this.authService.getUserId(); // Használjuk a getUserId metódust
          if (userId) {
            this.saveUserIdToLocalStorage(userId); // Elmentjük
          }
          this.checkMusicSettingAndPlay();
        }),
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
        tap((userCredential: any) => {
          // Bejelentkezés után mentjük az userId-t
          const userId = userCredential?.user?.uid;
          if (userId) {
            this.saveUserIdToLocalStorage(userId); // Elmentjük
          }else{
            this.saveUserIdToLocalStorage('guest');
          }
          this.checkMusicSettingAndPlay();
        }),
        catchError(error => {
          this.loginError = 'Login error! Please try it later!';
          console.error('Guest Login Error:', error);
          return of(null);
        })
      )
      .subscribe();
  }
}
