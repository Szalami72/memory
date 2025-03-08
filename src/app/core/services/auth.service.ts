import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth'; // Importáld az AngularFireAuth szolgáltatást!
import firebase from 'firebase/compat/app'; // Importáld a firebase modult!
import { Auth, signInWithPopup, FacebookAuthProvider } from '@angular/fire/auth';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();
  public user: Observable<firebase.User | null> = this.afAuth.authState; // Felhasználói állapot stream az AngularFireAuth-ból

  constructor(public afAuth: AngularFireAuth, private auth: Auth) { // Injektáld az AngularFireAuth szolgáltatást!
    this.afAuth.authState.subscribe(user => { // Figyeld az authState változásait
      this.isLoggedInSubject.next(!!user); // Frissítsd az isLoggedInSubject-et a felhasználói állapot alapján
    });
  }

  async loginWithGoogle(): Promise<void> {
    try {
      const result = await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
      const user = result.user ?? null; // Ha user null, akkor alapértelmezett érték: null
      if (user) {
        console.log('Sikeres bejelentkezés Google-lel!', user);
        console.log('Felhasználó email:', user.email);
      } else {
        console.error('A felhasználó nem található!');
      }
    } catch (error) {
      console.error('Hiba a Google bejelentkezés során:', error);
      // Hibakezelés, felhasználói értesítés
      throw error;
    }
  }
  


  async loginWithFacebook() {
    try {
      const provider = new FacebookAuthProvider();
      provider.addScope('email'); // Email engedély hozzáadása
      const result = await signInWithPopup(this.auth, provider);
      
      console.log('Bejelentkezve:', result.user);
      console.log('Felhasználó email:', result.user.email);

      // További műveletek, pl. felhasználó adatok frissítés
    } catch (error) {
      console.error('Facebook login hiba:', error);
    }
  }

  async loginAsGuest(): Promise<void> {
    try {
      const result_1 = await this.afAuth.signInAnonymously();
      console.log('Sikeres vendég bejelentkezés!', result_1.user);
    } catch (error) {
      console.error('Hiba a vendég bejelentkezés során:', error);
      throw error;
    }
  }


  logout(): Promise<void> {
    return this.afAuth.signOut()
      .then(() => {
        console.log('Sikeres kijelentkezés!');
        // További műveletek kijelentkezés után, pl. felhasználó adatok törlése a helyi tárolóból
      }).catch(error => {
        console.error('Hiba a kijelentkezés során:', error);
        throw error;
      });
  }
}