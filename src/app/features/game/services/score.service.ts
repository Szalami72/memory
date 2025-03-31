import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of } from 'rxjs';
// Szükséges lehet: firstValueFrom vagy toPromise a Firestore lekérdezéshez Promise-ként
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../../../core/services/auth.service';
import { firstValueFrom } from 'rxjs'; // Importáljuk a firstValueFrom-ot

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  private scoreSubject = new BehaviorSubject<number>(0);
  score$ = this.scoreSubject.asObservable();

  // Marad a helyi cache BehaviorSubject-ekkel
  public bestScoreSubjects: { [key: string]: BehaviorSubject<number> } = {
    easy: new BehaviorSubject<number>(0),
    hard: new BehaviorSubject<number>(0),
    extreme: new BehaviorSubject<number>(0),
    challenge: new BehaviorSubject<number>(0),
  };

  constructor(private firestore: AngularFirestore, private authService: AuthService) {
    this.loadBestScoresFromLocalStorage(); // Betöltés induláskor
    // Opcionális: Figyeljük a user változást, és töltsük újra/szinkronizáljunk
    this.authService.user$.subscribe(user => {
        console.log("Auth state changed in ScoreService, potentially reloading scores...");
        // Itt lehetne Firestore-ból szinkronizálni a helyi cache-t bejelentkezéskor
        this.syncCacheWithFirestoreOnLogin();
    });
  }

  private getLocalStorageKey(difficulty: string): string {
    // User ID nélkül is működnie kell vendégként
    const userId = this.authService.getUserId() || 'guest_user'; // Használjunk placeholder-t vendégnek
    return `bestScore_${userId}_${difficulty}`;
  }

  private loadBestScoresFromLocalStorage(): void {
    console.log("Loading best scores from LocalStorage...");
    Object.keys(this.bestScoreSubjects).forEach(difficulty => {
      // A kulcs most már tartalmazza a user ID-t vagy a guest placeholder-t
      const storedScore = parseInt(localStorage.getItem(this.getLocalStorageKey(difficulty)) || '0', 10);
      this.bestScoreSubjects[difficulty].next(storedScore);
      console.log(`Loaded local score for ${difficulty}: ${storedScore}`);
    });
  }

  // Új metódus a cache szinkronizálására bejelentkezéskor
  private async syncCacheWithFirestoreOnLogin(): Promise<void> {
    const userId = this.authService.getUserId();
    if (userId && userId !== 'guest') {
        console.log(`User ${userId} logged in. Syncing local score cache with Firestore.`);
        try {
            const userDocRef = this.firestore.collection('users').doc(userId);
            const userDoc = await firstValueFrom(userDocRef.get()); // Promise-ként kezeljük

            if (userDoc.exists) {
                const firestoreData = userDoc.data() as any;
                Object.keys(this.bestScoreSubjects).forEach(difficulty => {
                    const firestoreScore = firestoreData?.[difficulty] || 0;
                    const localScore = this.bestScoreSubjects[difficulty].getValue();
                    // Csak akkor írjuk felül a helyit, ha a Firestore jobb VAGY ha a helyi 0 (kezdeti)
                    if (firestoreScore > localScore || localScore === 0) {
                        console.log(`Syncing ${difficulty}: Firestore (${firestoreScore}) > Local (${localScore}). Updating local cache.`);
                        localStorage.setItem(this.getLocalStorageKey(difficulty), firestoreScore.toString());
                        this.bestScoreSubjects[difficulty].next(firestoreScore);
                    }
                });
            } else {
                console.log("User document doesn't exist in Firestore yet for score sync.");
                 // Itt lehetne nullázni a helyi cache-t, ha ez a kívánt viselkedés
                 Object.keys(this.bestScoreSubjects).forEach(difficulty => {
                     localStorage.setItem(this.getLocalStorageKey(difficulty), '0');
                     this.bestScoreSubjects[difficulty].next(0);
                 });
            }
        } catch (error) {
            console.error("Error syncing cache with Firestore on login:", error);
        }
    } else {
        // Ha kijelentkezik a user vagy vendég, töltsük újra a "guest" localStorage értékeket
        this.loadBestScoresFromLocalStorage();
    }
  }


  incrementScore(points: number): void {
    this.scoreSubject.next(this.scoreSubject.getValue() + points);
  }

  resetScore(): void {
    this.scoreSubject.next(0);
  }

  getScore(): number {
    return this.scoreSubject.getValue();
  }

  // Ez a metódus inkább a UI-nak szól, a cache-t mutatja, amit szinkronizálunk
  getBestScore(difficulty: string): Observable<number> {
    // Mindig a BehaviorSubject értékét adjuk vissza Observable-ként
    // A subject értékét a loadBestScores és a syncCacheWithFirestoreOnLogin frissíti
    return this.bestScoreSubjects[difficulty].asObservable();
  }


  // --- MÓDOSÍTOTT checkPreviousBestScore (async) ---
  async checkPreviousBestScore(newScore: number, difficulty: string): Promise<boolean> {
    const userId = this.authService.getUserId();
    const localBestScore = this.bestScoreSubjects[difficulty].getValue(); // Aktuális helyi érték

    // ---- Bejelentkezett felhasználó ----
    if (userId && userId !== 'guest') {
      try {
        console.log(`Checking best score for logged-in user ${userId}, difficulty ${difficulty}. New score: ${newScore}`);
        const userDocRef = this.firestore.collection('users').doc(userId);
        // Használjunk firstValueFrom-ot a Promise alapú kezeléshez
        const userDoc = await firstValueFrom(userDocRef.get());
        const firestoreBestScore = userDoc.exists ? (userDoc.data() as any)?.[difficulty] || 0 : 0;
        console.log(`Current Firestore best score for ${difficulty}: ${firestoreBestScore}`);

        if (newScore > firestoreBestScore) {
          console.log(`New Firestore best score for ${difficulty}! ${newScore} > ${firestoreBestScore}`);
          // Mentsük el az új rekordot Firestore-ba (ez már Promise-t ad vissza)
          await this.saveBestScoreToDatabase(userId, newScore, difficulty);

          // Frissítsük a helyi cache-t is (localStorage és BehaviorSubject)
          localStorage.setItem(this.getLocalStorageKey(difficulty), newScore.toString());
          this.bestScoreSubjects[difficulty].next(newScore);
          console.log(`Local cache updated for ${difficulty} with new best score: ${newScore}`);
          return true; // Új legjobb pontszám!
        } else {
           // Nem új Firestore rekord.
           // Opcionális: Szinkronizáljuk a helyi cache-t, ha a Firestore-ban magasabb van, mint a helyiben.
           if (firestoreBestScore > localBestScore) {
               console.log(`Syncing local cache for ${difficulty}. Firestore (${firestoreBestScore}) > Local cache (${localBestScore}).`);
               localStorage.setItem(this.getLocalStorageKey(difficulty), firestoreBestScore.toString());
               this.bestScoreSubjects[difficulty].next(firestoreBestScore);
           }
           console.log(`New score (${newScore}) is not better than Firestore best (${firestoreBestScore}) for ${difficulty}.`);
          return false; // Nem új legjobb pontszám.
        }
      } catch (error) {
        console.error('Error checking/saving Firestore best score:', error);
        // Hiba esetén fallback: hasonlítsuk a helyihez, de logoljuk a hibát.
        console.warn('Firestore check failed. Falling back to local comparison.');
        if (newScore > localBestScore) {
          localStorage.setItem(this.getLocalStorageKey(difficulty), newScore.toString());
          this.bestScoreSubjects[difficulty].next(newScore);
          console.log(`Local cache updated for ${difficulty} after Firestore error: ${newScore}`);
          return true; // Legalább helyi rekord (de jelezzük a hibát).
        }
        return false;
      }
    }
    // ---- Vendég felhasználó ----
    else {
      console.log(`Checking best score for guest user, difficulty ${difficulty}. New score: ${newScore}`);
      console.log(`Current local best score for ${difficulty}: ${localBestScore}`);
      if (newScore > localBestScore) {
        console.log(`New local best score for guest! ${newScore} > ${localBestScore}`);
        localStorage.setItem(this.getLocalStorageKey(difficulty), newScore.toString());
        this.bestScoreSubjects[difficulty].next(newScore);
        return true; // Új helyi rekord.
      } else {
        console.log(`New score (${newScore}) is not better than local best (${localBestScore}) for ${difficulty}.`);
        return false; // Nem új helyi rekord.
      }
    }
  }


  // saveBestScoreToDatabase már async, ez rendben van
  async saveBestScoreToDatabase(userId: string, score: number, difficulty: string): Promise<void> {
    // Ellenőrzés, hogy biztosan ne vendég userrel próbáljunk menteni
    if (!userId || userId === 'guest') {
        console.error("Attempted to save score for guest user. Aborting.");
        return;
    }
    try {
      console.log(`Saving score to Firestore for user: ${userId}, difficulty: ${difficulty}, score: ${score}`);
      await this.firestore.collection('users').doc(userId).set({
        [difficulty]: score // Csak az adott nehézséget frissítjük/hozzuk létre
      }, { merge: true }); // merge: true -> többi adat megmarad
      console.log(`Best score saved successfully to Firestore for ${difficulty}: ${score}`);
    } catch (error) {
      console.error('Error saving best score to Firestore:', error);
      // Itt lehetne további hiba kezelés, pl. visszajelzés a felhasználónak
      throw error; // Dobjuk tovább a hibát, hogy a hívó tudjon róla
    }
  }
}