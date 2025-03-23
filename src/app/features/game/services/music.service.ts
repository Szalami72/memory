import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private audio: HTMLAudioElement;
  private isPlaying = false;
  private isPreloaded = false;
  private audioElements: { [key: number]: HTMLAudioElement } = {};

  constructor() {
    this.audio = new Audio('assets/sounds/background-music.mp3');
    this.audio.loop = true;
    // Ha szükséges, kezdetben elnémítva is indíthatod:
    // this.audio.muted = true;
  }

  preloadSounds(): void {
    for (let i = 1; i <= 9; i++) {
      if (i === 5) continue; // Az 5-ös hang kihagyása
  
      const audio = new Audio(`../../../../../assets/sounds/${i}.mp3`);
      audio.load(); // Betöltés előre
      this.audioElements[i] = audio;
    }
    this.isPreloaded = true;
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

  playSound(value: number): void {
    if (!this.isPreloaded) return; // Ha még nem töltöttek be a hangok, ne játszd le

    const audio = this.audioElements[value];
    if (audio) {
      audio.currentTime = 0; // Mindig az elejéről induljon
      audio.play();
    }
  }

}
