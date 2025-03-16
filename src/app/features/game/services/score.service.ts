import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore'; // Firebase Firestore importálása
import { AuthService } from '../../../core/services/auth.service';// AuthService importálása a felhasználó azonosításához

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  private scoreSubject = new BehaviorSubject<number>(0);
  score$ = this.scoreSubject.asObservable();

  public bestScoreSubject = new BehaviorSubject<number>(parseInt(localStorage.getItem('bestScore') || '0', 10));
  bestScore$ = this.bestScoreSubject.asObservable();  // Observable a legjobb pontszámhoz

  constructor(private firestore: AngularFirestore, private authService: AuthService) { }

  incrementScore(points: number): void {
    this.scoreSubject.next(this.scoreSubject.getValue() + points);
  }

  resetScore(): void {
    this.scoreSubject.next(0);
  }

  getScore(): number {
    return this.scoreSubject.getValue();
  }

  getBestScore(): Observable<number> {
    const userId = this.authService.getUserId();
    if (userId && userId !== 'guest') {
      return this.firestore.collection('users').doc(userId).valueChanges().pipe(
        map((userData: any) => userData?.bestScore || parseInt(localStorage.getItem('bestScore') || '0', 10))
      );
    } else {
      // Ha nincs bejelentkezett felhasználó, a localStorage-ból vesszük
      return of(parseInt(localStorage.getItem('bestScore') || '0', 10));
    }
  }
  

  checkPreviousBestScore(newScore: number): boolean {
    const bestScore = this.bestScoreSubject.getValue();
    const userId = this.authService.getUserId();
    
    if (newScore > bestScore) {
      // Frissítjük a localStorage-ot
      localStorage.setItem('bestScore', newScore.toString());
      this.bestScoreSubject.next(newScore);
  
      if (userId && userId !== 'guest') {
        // Firestore-ból lekérjük a legjobb pontszámot
        this.firestore.collection('users').doc(userId).get().subscribe(userDoc => {
          const firestoreBestScore = userDoc.exists ? (userDoc.data() as any).bestScore || 0 : 0;
          
          // Ha a helyi pontszám nagyobb, mint a Firestore-ban tárolt, mentjük
          if (newScore > firestoreBestScore) {
            this.saveBestScoreToDatabase(userId, newScore);
          }
        }, error => {
          console.error('Error fetching Firestore best score:', error);
        });
      }
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
