import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private userSubject = new BehaviorSubject<firebase.User | null>(null);
    public user$: Observable<firebase.User | null> = this.userSubject.asObservable();

    public isLoggedInSubject = new BehaviorSubject<boolean>(false);
    public isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();

    private isGuestSubject = new BehaviorSubject<boolean>(false);
    public isGuest$ = this.isGuestSubject.asObservable();

    constructor(private afAuth: AngularFireAuth, private router: Router) {
        this.afAuth.authState.subscribe(async user => {
            if (user) {
                const refreshedUser = await this.afAuth.currentUser;
                this.userSubject.next(refreshedUser);
                this.isLoggedInSubject.next(true);
                localStorage.setItem('user', JSON.stringify(refreshedUser));
            } else {
                this.userSubject.next(null);
                this.isLoggedInSubject.next(false);
                localStorage.removeItem('user');
            }
        });
    }

    async loginWithGoogle(): Promise<void> {
        try {
            const result = await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
            if (result.user) {
                this.userSubject.next(result.user);
                this.router.navigate(['/home']);
            }
        } catch (error) {
            console.error('Hiba a Google bejelentkezés során:', error);
            throw error;
        }
    }

    async loginWithFacebook(): Promise<void> {
        try {
            const result = await this.afAuth.signInWithPopup(new firebase.auth.FacebookAuthProvider());
            if (result.user) {
                this.userSubject.next(result.user);
                this.router.navigate(['/home']);
            }
        } catch (error) {
            console.error('Hiba a Facebook bejelentkezés során:', error);
            throw error;
        }
    }

    async loginAsGuest(): Promise<void> {
        try {
            const result = await this.afAuth.signInAnonymously();
            if (result.user) {
                this.userSubject.next(result.user);
                this.isGuestSubject.next(true);
                localStorage.setItem('isGuest', 'true');
                this.router.navigate(['/home']);
            }
        } catch (error) {
            console.error('Hiba a vendég bejelentkezés során:', error);
            throw error;
        }
    }

    async logout(): Promise<void> {
        try {
            await this.afAuth.signOut();
            this.userSubject.next(null);
            this.isLoggedInSubject.next(false);
            this.isGuestSubject.next(false);
            localStorage.removeItem('isGuest');
            this.router.navigate(['auth/login']);
        } catch (error) {
            console.error('Hiba a kijelentkezés során:', error);
            throw error;
        }
    }

    getUserId(): string | null {
      if (this.isGuestSubject.value) {
          return null; // Vendég esetén null-t adunk vissza
      }
      const currentUser = this.userSubject.value;
      return currentUser ? currentUser.uid : null;
  }

  async getUserIdAsync(): Promise<string | null> {
      if (this.isGuestSubject.value) {
          return null; // Vendég esetén null-t adunk vissza
      }
      const currentUser = await this.afAuth.currentUser;
      return currentUser ? currentUser.uid : null;
  }
  
}