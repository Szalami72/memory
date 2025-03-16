import { Component, OnInit, OnDestroy } from '@angular/core';
import { ScoreService } from '../../services/score.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer-game',
  standalone: true,
  imports: [],
  templateUrl: './footer-game.component.html',
  styleUrl: './footer-game.component.css'
})
export class FooterGameComponent implements OnInit, OnDestroy {
  currentScore: number = 0;
  private scoreSubscription: Subscription | undefined;

  constructor(private scoreService: ScoreService) { }

  ngOnInit(): void {
    this.scoreSubscription = this.scoreService.score$.subscribe(score => {
      this.currentScore = score;
    });
  }

  ngOnDestroy(): void {
    if (this.scoreSubscription) {
      this.scoreSubscription.unsubscribe();
    }
  }
}
