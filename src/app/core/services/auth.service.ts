import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Auth, signInWithPopup, FacebookAuthProvider, GoogleAuthProvider } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<firebase.User | null>(null);
  public user$: Observable<firebase.User | null> = this.userSubject.asObservable();

  public isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();

  ngOnInit() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.userSubject.next(JSON.parse(storedUser));
      this.isLoggedInSubject.next(true);
    }
  }
  
  constructor(private afAuth: AngularFireAuth, private auth: Auth, private router: Router) {
    this.afAuth.authState.subscribe(async user => {
      if (user) {
        const refreshedUser = await this.afAuth.currentUser;
        this.userSubject.next(refreshedUser);
        this.isLoggedInSubject.next(true);
        localStorage.setItem('user', JSON.stringify(refreshedUser)); // 🔴 Felhasználó mentése
      } else {
        this.userSubject.next(null);
        this.isLoggedInSubject.next(false);
        localStorage.removeItem('user'); // 🔴 Ha nincs bejelentkezve, töröljük az állapotot
      }
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
      this.router.navigate(['auth/login']); // Átirányítás a bejelentkező oldalra
    } catch (error) {
      console.error('Hiba a kijelentkezés során:', error);
      throw error;
    }
  }

  // Segédfüggvény a Google hitelesítési adat beszerzéséhez a meglévő fiókhoz (javított verzió)
  private async getCredentialForExistingAccount(user: firebase.User): Promise<any> { // 👈 Eltávolítottuk a providerId paramétert
    const googleProviderData = user.providerData.find(provider => provider?.providerId === 'google.com'); // 👈 Keressük a Google provider adatokat
    if (googleProviderData) { // 👈 Ellenőrizzük, hogy van-e Google provider adat
      const idToken = await user.getIdToken();
      const googleCredential = GoogleAuthProvider.credential(idToken);
      return googleCredential;
    }
    return null;
  }

  public getUserEmail(user: firebase.User | null): string | null { // ✅getUserEmail függvény
    if (!user) {
      return null; // Ha nincs felhasználó, akkor nincs email cím
    }

    if (user.email) {
      return user.email; // Ha közvetlenül van email cím, akkor használjuk azt
    }

    if (user.providerData && user.providerData.length > 0) {
      // Végigmegyünk a providerData tömbön, és megkeressük az email címet
      for (const provider of user.providerData) {
        if (provider && provider.email) {
          return provider.email; // Ha találunk email címet provider adatban, akkor használjuk azt
        }
      }
    }

    return null; // Ha semhol nem találunk email címet, akkor null-t adunk vissza
  }
}
