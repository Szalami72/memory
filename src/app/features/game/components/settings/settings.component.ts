import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';

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

  ngOnInit() {
    this.loadSoundSetting();
    this.loadColorsSetting();
  }

  constructor(private router: Router) { 
    const savedSound = localStorage.getItem('soundSetting');
    if (savedSound !== null) {
      this.isSoundOn = JSON.parse(savedSound); // Beállítás betöltése
    }
    const savedColors = localStorage.getItem('colorsSetting');
    if (savedColors !== null) {
      this.isColorsOn = JSON.parse(savedColors); // Beállítás betöltése
    }
  }

  backToStartPage(): void {
    this.router.navigate(['/home']);
  }

  async toggleSound() {
    this.isSoundOn = !this.isSoundOn;
    await Preferences.set({
      key: 'soundSetting',
      value: JSON.stringify(this.isSoundOn)
    });
  }
  
  async loadSoundSetting() {
    const { value } = await Preferences.get({ key: 'soundSetting' });
    this.isSoundOn = value ? JSON.parse(value) : true; // Alapértelmezett érték: true
  }

  async toggleColors() {
    this.isColorsOn = !this.isColorsOn;
    await Preferences.set({
      key: 'colorsSetting',
      value: JSON.stringify(this.isColorsOn)
    });
  }

  async loadColorsSetting() {
    const { value } = await Preferences.get({ key: 'colorsSetting' });
    this.isColorsOn = value ? JSON.parse(value) : true; // Alapértelmezett érték: true
  }
}
