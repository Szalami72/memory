import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  private scoreSubject = new BehaviorSubject<number>(0);
  score$ = this.scoreSubject.asObservable();

  public bestScoreSubject = new BehaviorSubject<number>(0);
  bestScore$ = this.bestScoreSubject.asObservable();

  constructor(private firestore: AngularFirestore, private authService: AuthService) {
    this.initBestScore(); // Inicializáláskor betöltjük a localStorage-ból az aktuális user adatait
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

  private initBestScore(): void {
    const userId = this.authService.getUserId();
    if (userId && userId !== 'guest') {
      const localStorageKey = `bestScore_${userId}`;
      const localBestScore = parseInt(localStorage.getItem(localStorageKey) || '0', 10);
      this.bestScoreSubject.next(localBestScore);
    }
  }

  getBestScore(): Observable<number> {
    const userId = this.authService.getUserId();
    if (userId && userId !== 'guest') {
      const localStorageKey = `bestScore_${userId}`;
      return this.firestore.collection('users').doc(userId).valueChanges().pipe(
        map((userData: any) => userData?.bestScore || parseInt(localStorage.getItem(localStorageKey) || '0', 10))
      );
    } else {
      return of(0);
    }
  }

  checkPreviousBestScore(newScore: number): boolean {
    const userId = this.authService.getUserId();
    if (!userId || userId === 'guest') {
      console.log('Guest mode - best score is not saved.');
      return false;
    }

    const localStorageKey = `bestScore_${userId}`;
    const bestScore = this.bestScoreSubject.getValue();

    if (newScore > bestScore) {
      // Frissítjük a localStorage-ot
      localStorage.setItem(localStorageKey, newScore.toString());
      this.bestScoreSubject.next(newScore);

      // Firestore-ból lekérjük a legjobb pontszámot és frissítjük, ha szükséges
      this.firestore.collection('users').doc(userId).get().subscribe(userDoc => {
        const firestoreBestScore = userDoc.exists ? (userDoc.data() as any).bestScore || 0 : 0;
        
        if (newScore > firestoreBestScore) {
          this.saveBestScoreToDatabase(userId, newScore);
        }
      }, error => {
        console.error('Error fetching Firestore best score:', error);
      });

      return true;
    }
    return false;
  }

  async saveBestScoreToDatabase(userId: string, score: number): Promise<void> {
    try {
      console.log('Saving score for user:', userId, 'score:', score);
      await this.firestore.collection('users').doc(userId).set({
        bestScore: score
      }, { merge: true });
      console.log('Best score saved to Firestore:', score);
    } catch (error) {
      console.error('Error saving best score to Firestore:', error);
    }
  }
}
