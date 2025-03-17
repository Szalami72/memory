import { Component, OnInit, OnDestroy } from '@angular/core';
import { ScoreService } from '../../services/score.service';
import { DifficultyService } from '../../services/difficulty.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer-game',
  standalone: true,
  imports: [],
  templateUrl: './footer-game.component.html',
  styleUrls: ['./footer-game.component.css']
})
export class FooterGameComponent implements OnInit, OnDestroy {
  currentScore: number = 0;
  bestScore: number = 0;
  private scoreSubscription: Subscription | undefined;
  private bestScoreSubscription: Subscription | undefined;
  private difficultySubscription: Subscription | undefined;

  constructor(
    private scoreService: ScoreService,
    private difficultyService: DifficultyService
  ) {}

  ngOnInit(): void {
    // Figyeljük a nehézségi szint változását, és ennek megfelelően frissítjük a bestScore értékét
    this.difficultySubscription = this.difficultyService.difficulty$.subscribe(difficulty => {
      console.log('Difficulty changed:', difficulty);
      this.loadBestScore(difficulty);
    });

    // Figyeljük az aktuális pontszám változását
    this.scoreSubscription = this.scoreService.score$.subscribe(score => {
      this.currentScore = score;
    });
  }

  private loadBestScore(difficulty: string): void {
    // Előző feliratkozás leállítása, ha volt
    this.bestScoreSubscription?.unsubscribe();
    
    this.bestScoreSubscription = this.scoreService.getBestScore(difficulty).subscribe(bestScore => {
      console.log(`Best score for difficulty ${difficulty}:`, bestScore);
      this.bestScore = bestScore;
    });
  }

  ngOnDestroy(): void {
    this.scoreSubscription?.unsubscribe();
    this.bestScoreSubscription?.unsubscribe();
    this.difficultySubscription?.unsubscribe();
  }
}