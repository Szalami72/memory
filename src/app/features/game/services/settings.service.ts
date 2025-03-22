import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../../../core/services/auth.service';
import { BehaviorSubject } from 'rxjs';

interface UserSettings {
    soundSetting?: boolean;
    colorsSetting?: boolean;
    musicSetting?: boolean;
    vibrationSetting?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    private userSettingsSubject = new BehaviorSubject<UserSettings>({
        soundSetting: true,
        colorsSetting: true,
        musicSetting: true,
        vibrationSetting: true,
    });

    userSettings$ = this.userSettingsSubject.asObservable();

    private userId: string | null = null;

    constructor(
        private firestore: AngularFirestore,
        private authService: AuthService
    ) {
        this.initializeUserId();
    }

    async initializeUserId() {
        try {
            this.userId = await this.authService.getUserIdAsync();
            if (this.userId) {
                console.log('Felhasználó azonosító:', this.userId);
                await this.loadSettings();
            } else {
                console.log('Nem található felhasználói azonosító!');
                await this.loadSettings(); // Vendég esetén is betöltjük a beállításokat a localStorage-ból
            }
        } catch (error) {
            console.error('Hiba történt az azonosító lekérésekor:', error);
            await this.loadSettings(); // Hibás azonosító esetén is betöltjük a beállításokat a localStorage-ból
        }
    }

    async loadSettings() {
        if (!this.userId) {
            console.log('Nincs elérhető felhasználói azonosító, localStorage-ból töltjük be a beállításokat.');
        }

        if (this.userId === null) {
            // Vendég felhasználó esetén csak a localStorage-t használjuk
            const savedSettings = await this.getSettingsFromPreferences();
            if (savedSettings) {
                this.userSettingsSubject.next(savedSettings);
            } else {
                this.userSettingsSubject.next({
                    soundSetting: true,
                    colorsSetting: true,
                    musicSetting: true,
                    vibrationSetting: true,
                });
            }
        } else {
            // Bejelentkezett felhasználó esetén a Firebase-t használjuk
            const userDoc = await this.firestore.collection('users').doc(this.userId).get().toPromise();

            if (userDoc?.exists) {
                const settings = userDoc.data() as UserSettings;
                this.userSettingsSubject.next(settings);
            } else {
                const savedSettings = await this.getSettingsFromPreferences();
                if (savedSettings) {
                    this.userSettingsSubject.next(savedSettings);
                } else {
                    this.userSettingsSubject.next({
                        soundSetting: true,
                        colorsSetting: true,
                        musicSetting: true,
                        vibrationSetting: true,
                    });
                }
            }
        }
    }

    private async getSettingsFromPreferences(): Promise<UserSettings | null> {
        const soundSetting = await this.getSetting('soundSetting');
        const colorsSetting = await this.getSetting('colorsSetting');
        const musicSetting = await this.getSetting('musicSetting');
        const vibrationSetting = await this.getSetting('vibrationSetting');

        if (soundSetting !== undefined || colorsSetting !== undefined || musicSetting !== undefined || vibrationSetting !== undefined) {
            return {
                soundSetting,
                colorsSetting,
                musicSetting,
                vibrationSetting
            };
        }

        return null;
    }

    private async getSetting(key: string): Promise<boolean | undefined> {
        const { value } = await Preferences.get({ key });
        return value !== null ? JSON.parse(value) : undefined;
    }

    async setSetting(key: string, value: boolean): Promise<void> {
        if (!this.userId) {
            await this.initializeUserId();
        }

        await Preferences.set({ key, value: JSON.stringify(value) });
        console.log(`Setting ${key} has been saved in Preferences with value: ${value}`);

        if (this.userId && this.userId !== null) {
            // Bejelentkezett felhasználó esetén a Firebase-t használjuk
            const updateData: Partial<UserSettings> = { [key]: value };

            try {
                console.log(`Attempting to update Firestore for user ${this.userId}`);
                await this.firestore.collection('users').doc(this.userId).set(updateData, { merge: true });
                console.log(`Firestore updated with ${key}: ${value}`);
            } catch (error) {
                console.error('Error updating Firestore:', error);
            }
        } else {
            console.log('Guest user, skipping Firestore update.');
        }

        const updatedSettings = { ...this.userSettingsSubject.value, [key]: value };
        this.userSettingsSubject.next(updatedSettings);
    }
}