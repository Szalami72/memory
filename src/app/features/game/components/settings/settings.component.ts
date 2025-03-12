import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { MusicService } from '../../services/music.service'; // igazítsd az elérési útvonalat

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css', '../../../../shared/styles/menu-windows.css']
})
export class SettingsComponent implements OnInit {

  isSoundOn = true;
  isColorsOn = true;
  isMusicOn = true;
  isVibrationOn = true;

  constructor(private router: Router,
              private musicService: MusicService) {}

  async ngOnInit() {
    this.isSoundOn = await this.getSetting('soundSetting', true);
    this.isColorsOn = await this.getSetting('colorsSetting', true);
    this.isMusicOn = await this.getSetting('musicSetting', true);
    this.isVibrationOn = await this.getSetting('vibrationSetting', true);
  }

  async getSetting(key: string, defaultValue: boolean): Promise<boolean> {
    const { value } = await Preferences.get({ key });
    return value !== null ? JSON.parse(value) : defaultValue;
  }

  async setSetting(key: string, value: boolean): Promise<void> {
    await Preferences.set({
      key,
      value: JSON.stringify(value)
    });
  }

  async toggleSetting(setting: 'isSoundOn' | 'isColorsOn' | 'isMusicOn' | 'isVibrationOn', key: string) {
    this[setting] = !this[setting];
    await this.setSetting(key, this[setting]);

    // Ha a zene beállítást módosítjuk, indítsuk vagy állítsuk le a zenét a MusicService segítségével
    if (setting === 'isMusicOn') {
      if (this.isMusicOn) {
        this.musicService.playMusic();
      } else {
        this.musicService.stopMusic();
      }
    }
  }

  backToStartPage(): void {
    this.router.navigate(['/home']);
  }
}
