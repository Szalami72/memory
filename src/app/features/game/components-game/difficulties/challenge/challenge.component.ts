import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameBaseComponent } from '../game-base/game-base.component';
import { GameService } from '../../../services/game.service';
import { LevelService } from '../../../services/level.service';
import { ScoreService } from '../../../services/score.service';
import { MusicService } from '../../../services/music.service';
import { SettingsService } from '../../../services/settings.service';
import { DifficultyService } from '../../../services/difficulty.service';
@Component({
  selector: 'app-challenge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: '../../../../../shared/html/difficulties.html',
  styleUrls: ['./challenge.component.css', '../../../../../shared/styles/difficulties.css']
})
export class ChallengeComponent extends GameBaseComponent {

  constructor(
    gameService: GameService,
    levelService: LevelService,
    scoreService: ScoreService,
    musicService: MusicService,
    settingsService: SettingsService,
    difficultyService: DifficultyService,
    cdr: ChangeDetectorRef
  ) {
    super(gameService, levelService, scoreService, musicService, settingsService, difficultyService, cdr);
  }

  generateCorrectSequence(): void {
    if (this.level === 1) {
      this.correctSequence = [this.gameService.getRandomNumberWithoutFive()];
      this.scoreService.resetScore(); // A pontszámot itt nullázzuk az Easy módban az első szinten
    } else {
      this.correctSequence.push(this.gameService.getRandomNumberWithoutFive());
    }
  }

  override async highlightSequence(): Promise<void> {
    for (const value of this.correctSequence) {
      if (!this.isGameRunning) {
        return;
      }
      const index = value - 1;
      this.playSound(value);
      await this.delay(500);
     
    }

}

}
