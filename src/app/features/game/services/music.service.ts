import { Injectable, OnDestroy, OnInit } from '@angular/core'; // OnInit importálva, bár nincs használva a lifecycle hook
import { SettingsService } from './settings.service';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
// OnDestroy interfész hozzáadva a takarításhoz
export class MusicService implements OnDestroy { // OnInit eltávolítva, ha nincs ngOnInit metódus
  private audio: HTMLAudioElement;
  private isPlaying = false;
  private isPreloaded = false;
  private audioElements: { [key: number]: HTMLAudioElement } = {};
  private settingsSubscription: Subscription | null = null;
  soundSetting: boolean = true;

  // ngOnInit felesleges, ha üres
  // ngOnInit(): void {
  // }

  constructor(private settingsService: SettingsService) {
    this.audio = new Audio('assets/sounds/background-music.mp3');
    this.audio.loop = true;

    // Feliratkozás a beállítások változásaira
    this.settingsSubscription = this.settingsService.userSettings$.subscribe(settings => {
      this.soundSetting = settings.soundSetting ?? true; // Default true, ha undefined
      console.log('Hangbeállítás frissítve:', this.soundSetting);
      // Alkalmazd a beállítást a háttérzenére is, ha szükséges
      this.audio.muted = !this.soundSetting;
    });
   

    // Hangok előtöltése a konstruktorban vagy egy init metódusban
    this.preloadSounds(); // Hívd meg itt, vagy egy külön inicializáló metódusból
  }

  ngOnDestroy(): void {
    // Leiratkozás a memóriaszivárgás elkerülése érdekében
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
    // Állítsd le a hangokat és tisztítsd az erőforrásokat, ha szükséges
    this.stopMusic();
    Object.values(this.audioElements).forEach(audio => {
      audio.pause();
      audio.src = ''; // Opcionális: erőforrások felszabadítása
    });
    this.audioElements = {};
  }


  preloadSounds(): void {
    if (this.isPreloaded) return; // Ne töltsd be újra

    console.log('Hangok előtöltése...');
    for (let i = 1; i <= 9; i++) {
      if (i === 5) continue; // 5-ös hang kihagyása

      const audio = new Audio(`../../../../../assets/sounds/${i}.mp3`);
      audio.load(); // Betöltés indítása
      this.audioElements[i] = audio;
    }
    this.isPreloaded = true;
    console.log('Hangok betöltve.');
  }

  playMusic(): void {
    // Csak akkor játssza le, ha a hang be van kapcsolva a beállításokban
    if (!this.isPlaying && this.soundSetting) {
      this.audio.play().then(() => {
        this.isPlaying = true;
        this.audio.muted = false; // Biztosítsuk, hogy nincs némítva
        console.log('Háttérzene lejátszása.');
      }).catch(error => console.error('Nem sikerült lejátszani a zenét:', error));
    } else if (!this.soundSetting) {
      console.log('A zene le van tiltva a beállításokban.');
    }
  }

  stopMusic(): void {
    if (this.isPlaying) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
      console.log('Háttérzene megállítva.');
    }
  }

  playSound(value: number): void {
    // Ellenőrizd a beállításokat és az előtöltést
    if (!this.isPreloaded || !this.soundSetting) {
        // console.log(`Hang ${value} lejátszása kihagyva (preloaded: ${this.isPreloaded}, soundSetting: ${this.soundSetting})`);
        return;
    }

    const audio = this.audioElements[value];
    if (audio) {
      // --- MÓDOSÍTÁS KEZDETE ---
      // Ha éppen játszik, állítsd le és tekerd vissza, hogy újrainduljon
      if (!audio.paused) {
        audio.pause();
      }
      audio.currentTime = 0; // Mindig az elejéről induljon
      // --- MÓDOSÍTÁS VÉGE ---

      // Játszd le a hangot (a catch segít a böngésző autoplay policy miatti hibák elkapásában)
      audio.play().catch(error => {
          // Gyakori hiba, ha a felhasználó még nem interaktált az oldallal
          if (error.name === 'NotAllowedError') {
              console.warn(`Hang ${value} lejátszása blokkolva (NotAllowedError). Felhasználói interakció szükséges.`);
          } else {
              console.error(`Hiba a(z) ${value}. hang lejátszásakor:`, error);
          }
      });
    } else {
      console.warn(`A(z) ${value} számú hang nem található vagy nincs betöltve.`);
    }
  }

  // Segédfüggvény a beállítások lekérdezéséhez (opcionális, de hasznos lehet)
  getSoundSetting(): boolean {
      return this.soundSetting;
  }
}