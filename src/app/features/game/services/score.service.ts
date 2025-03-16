import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  private scoreSubject = new BehaviorSubject<number>(0);
  score$ = this.scoreSubject.asObservable();

  private bestScoreSubject = new BehaviorSubject<number>(parseInt(localStorage.getItem('bestScore') || '0', 10));
  bestScore$ = this.bestScoreSubject.asObservable();  // Observable a legjobb pontszámhoz

  incrementScore(points: number): void {
    this.scoreSubject.next(this.scoreSubject.getValue() + points);
  }

  resetScore(): void {
    this.scoreSubject.next(0);
  }

  getScore(): number {
    return this.scoreSubject.getValue();
  }

  getBestScore(): number {
    return this.bestScoreSubject.getValue();
  }

  checkPreviousBestScore(newScore: number): boolean {
    const bestScore = this.bestScoreSubject.getValue();

    if (newScore > bestScore) {
      // Ha az új pontszám nagyobb, mint a legjobb pontszám, frissítjük a bestScore értéket
      localStorage.setItem('bestScore', newScore.toString());
      this.bestScoreSubject.next(newScore);  // Frissítjük a bestScoreSubject értékét
      return true;  // Visszatérünk true-val, hogy a HTML-ben megjelenhessen a "New best!"
    }
    return false;
  }
}
