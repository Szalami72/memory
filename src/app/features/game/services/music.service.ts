import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private audio: HTMLAudioElement;
  private isPlaying = false;

  constructor() {
    this.audio = new Audio('assets/sounds/background-music.mp3');
    this.audio.loop = true;
    // Ha szükséges, kezdetben elnémítva is indíthatod:
    // this.audio.muted = true;
  }

  playMusic(): void {
    if (!this.isPlaying) {
      this.audio.play().then(() => {
        this.isPlaying = true;
        // Ha elnémítva indítottad, feloldhatod a némítást itt egy felhasználói interakció után:
        // this.audio.muted = false;
      }).catch(error => console.error('Nem sikerült lejátszani a zenét:', error));
    }
  }

  stopMusic(): void {
    if (this.isPlaying) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
    }
  }

  playSound(path: string): void {
      const audio = new Audio(path);
    audio.volume = 1.0;
  
    audio.play().then(() => {
    }).catch(error => {
    });
  
  }

}
