import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Auth, signInWithPopup, FacebookAuthProvider } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<firebase.User | null>(null);
  public user$: Observable<firebase.User | null> = this.userSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();

  constructor(private afAuth: AngularFireAuth, private auth: Auth, private router: Router) {
    // Figyeljük az auth állapotát, és frissítjük a userSubject-et
    this.afAuth.authState.subscribe(user => {
      this.userSubject.next(user);
      this.isLoggedInSubject.next(!!user);
    });
  }

  // ✅ Google bejelentkezés
  async loginWithGoogle(): Promise<void> {
    try {
      const result = await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
      if (result.user) {
        this.userSubject.next(result.user);
        console.log('Sikeres bejelentkezés Google-lel:', result.user);
        this.router.navigate(['/home']); // Átirányítás a kezdőoldalra
      } else {
        console.error('Google bejelentkezés sikertelen.');
      }
    } catch (error) {
      console.error('Hiba a Google bejelentkezés során:', error);
      throw error;
    }
  }

  // ✅ Facebook bejelentkezés
  async loginWithFacebook(): Promise<void> {
    try {
      const provider = new FacebookAuthProvider();
      provider.addScope('email');
      const result = await signInWithPopup(this.auth, provider);
      if (result.user) {
        const user = this.afAuth.currentUser;
        this.userSubject.next(await user);
        console.log('Sikeres bejelentkezés Facebookkal:', user);
        this.router.navigate(['/home']);
      } else {
        console.error('Facebook bejelentkezés sikertelen.');
      }
    } catch (error) {
      console.error('Hiba a Facebook bejelentkezés során:', error);
      throw error;
    }
  }

  // ✅ Vendég bejelentkezés
  async loginAsGuest(): Promise<void> {
    try {
      const result = await this.afAuth.signInAnonymously();
      if (result.user) {
        this.userSubject.next(result.user);
        console.log('Sikeres vendég bejelentkezés:', result.user);
        this.router.navigate(['/home']);
      } else {
        console.error('Vendég bejelentkezés sikertelen.');
      }
    } catch (error) {
      console.error('Hiba a vendég bejelentkezés során:', error);
      throw error;
    }
  }

  // ✅ Kijelentkezés
  async logout(): Promise<void> {
    try {
      await this.afAuth.signOut();
      this.userSubject.next(null);
      this.isLoggedInSubject.next(false);
      console.log('Sikeres kijelentkezés!');
      this.router.navigate(['/login']); // Átirányítás a bejelentkező oldalra
    } catch (error) {
      console.error('Hiba a kijelentkezés során:', error);
      throw error;
    }
  }
}
