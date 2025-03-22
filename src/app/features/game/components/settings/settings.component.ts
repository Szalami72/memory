import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MusicService } from '../../services/music.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css', '../../../../shared/styles/menu-windows.css']
})
export class SettingsComponent implements OnInit {

  // A változók most a service-ből származnak
  isSoundOn: boolean = true;
  isColorsOn: boolean = true;
  isMusicOn: boolean = true;
  isVibrationOn: boolean = true;

  constructor(
    private router: Router,
    private musicService: MusicService,
    private settingsService: SettingsService
  ) {}

  async ngOnInit() {
    this.settingsService.userSettings$.subscribe(settings => {
      this.isSoundOn = settings.soundSetting ?? true;
      this.isColorsOn = settings.colorsSetting ?? true;
      this.isMusicOn = settings.musicSetting ?? true;
      this.isVibrationOn = settings.vibrationSetting ?? true;
    });
  }

  // Beállítások váltása és mentése
  async toggleSetting(setting: 'isSoundOn' | 'isColorsOn' | 'isMusicOn' | 'isVibrationOn', key: string) {
    this[setting] = !this[setting];
    
    // A módosított beállítás mentése a service-en keresztül, ami automatikusan menti a Firestore-ba is
    await this.settingsService.setSetting(key, this[setting]);

    // Ha a zene beállítását módosítjuk, leállítjuk vagy elindítjuk a zenét
    if (setting === 'isMusicOn') {
      this.isMusicOn ? this.musicService.playMusic() : this.musicService.stopMusic();
    }
  }

  // Vissza a főoldalra
  backToStartPage(): void {
    this.router.navigate(['/home']);
  }
}
