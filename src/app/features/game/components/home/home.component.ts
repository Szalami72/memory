import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';
import { SettingsService } from '../../services/settings.service';
import { MusicService } from '../../services/music.service';
import { HeaderComponent } from '../header/header.component';
import { MenuComponent } from '../menu/menu.component';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
    standalone: true,
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    imports: [HeaderComponent, MenuComponent, RouterModule],
})
export class HomeComponent implements OnInit, OnDestroy {
    isSoundOn: boolean = true;
    isColorsOn: boolean = true;
    isMusicOn: boolean = true;
    isVibrationOn: boolean = true;

    private settingsSubscription: Subscription | null = null;

    constructor(
        private settingsService: SettingsService,
        private musicService: MusicService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.authService.user$.subscribe(user => {
            if (user) {
                const userId = user.uid;
                console.log('home-userid:', userId);

                // Beállítások betöltése a Firestore-ból, ha be van jelentkezve a felhasználó
                this.settingsService.initializeUserId();
            } else {
                console.log('Nincs bejelentkezett felhasználó');
            }
        });

        // Feliratkozás a beállítások változásaira
        this.settingsSubscription = this.settingsService.userSettings$.subscribe(settings => {
            this.isSoundOn = settings.soundSetting ?? true;
            this.isColorsOn = settings.colorsSetting ?? true;
            this.isMusicOn = settings.musicSetting ?? true;
            this.isVibrationOn = settings.vibrationSetting ?? true;

            // Zene kezelés
            this.isMusicOn ? this.musicService.playMusic() : this.musicService.stopMusic();
        });
    }

    // A komponens elpusztításakor töröljük a feliratkozásokat
    ngOnDestroy() {
        if (this.settingsSubscription) {
            this.settingsSubscription.unsubscribe();
        }
    }
}