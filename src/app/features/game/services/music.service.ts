import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private audio: HTMLAudioElement;
  private isPlaying = false;

  activeAudios: HTMLAudioElement[] = [];

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
    console.log('playSound() meghívva ezzel az útvonallal:', path);
  
    const audio = new Audio(path);
    audio.volume = 1.0;
  
    audio.play().then(() => {
      console.log('Lejátszás sikeres:', path);
      this.activeAudios.push(audio);
      console.log('Aktív hangok (hozzáadás után):', this.activeAudios);
    }).catch(error => {
      console.error('Lejátszási hiba:', error);
    });
  
    audio.addEventListener('ended', () => {
      this.removeAudio(audio);
    });
  }
  
  
  

  stopAllSounds(): void {
    console.log('Hangok leállítása:', this.activeAudios);
    
    this.activeAudios.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  
    this.activeAudios = [];
  }
  

  private removeAudio(audio: HTMLAudioElement): void {
    this.activeAudios = this.activeAudios.filter(a => a !== audio);
  }
}
