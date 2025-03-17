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

  public bestScoreSubjects: { [key: string]: BehaviorSubject<number> } = {
    easy: new BehaviorSubject<number>(0),
    hard: new BehaviorSubject<number>(0),
    extreme: new BehaviorSubject<number>(0),
    challenge: new BehaviorSubject<number>(0),
  };

  constructor(private firestore: AngularFirestore, private authService: AuthService) {
    this.loadBestScoresFromLocalStorage();
  }

  private getLocalStorageKey(difficulty: string): string {
    const userId = this.authService.getUserId();
    return `bestScore_${userId}_${difficulty}`;
  }

  private loadBestScoresFromLocalStorage(): void {
    Object.keys(this.bestScoreSubjects).forEach(difficulty => {
      const storedScore = parseInt(localStorage.getItem(this.getLocalStorageKey(difficulty)) || '0', 10);
      this.bestScoreSubjects[difficulty].next(storedScore);
    });
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

  getBestScore(difficulty: string): Observable<number> {
    const userId = this.authService.getUserId();
    if (userId && userId !== 'guest') {
      return this.firestore.collection('users').doc(userId).valueChanges().pipe(
        map((userData: any) => userData?.[difficulty] || this.bestScoreSubjects[difficulty].getValue())
      );
    } else {
      return of(this.bestScoreSubjects[difficulty].getValue());
    }
  }

  checkPreviousBestScore(newScore: number, difficulty: string): boolean {
    const bestScore = this.bestScoreSubjects[difficulty].getValue();
    const userId = this.authService.getUserId();
    
    if (newScore > bestScore) {
      localStorage.setItem(this.getLocalStorageKey(difficulty), newScore.toString());
      this.bestScoreSubjects[difficulty].next(newScore);
  
      if (userId && userId !== 'guest') {
        this.firestore.collection('users').doc(userId).get().subscribe(userDoc => {
          const firestoreBestScore = userDoc.exists ? (userDoc.data() as any)[difficulty] || 0 : 0;
          
          if (newScore > firestoreBestScore) {
            this.saveBestScoreToDatabase(userId, newScore, difficulty);
          }
        }, error => {
          console.error('Error fetching Firestore best score:', error);
        });
      }
      return true;
    }
    return false;
  }

  async saveBestScoreToDatabase(userId: string, score: number, difficulty: string): Promise<void> {
    try {
      console.log(`Saving score for user: ${userId}, difficulty: ${difficulty}, score: ${score}`);
      await this.firestore.collection('users').doc(userId).set({
        [difficulty]: score
      }, { merge: true });
      console.log(`Best score saved to Firestore for ${difficulty}: ${score}`);
    } catch (error) {
      console.error('Error saving best score to Firestore:', error);
    }
  }
}