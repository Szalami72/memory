import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameBaseComponent } from '../game-base/game-base.component';
import { GameService } from '../../../services/game.service';
import { LevelService } from '../../../services/level.service';
import { ScoreService } from '../../../services/score.service';
import { MusicService } from '../../../services/music.service';
import { SettingsService } from '../../../services/settings.service';
import { DifficultyService } from '../../../services/difficulty.service';

@Component({
  selector: 'app-scene-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: '../../../../../shared/html/difficulties.html',
  styleUrls: ['./easy.component.css', '../../../../../shared/styles/difficulties.css']
})
export class EasyComponent extends GameBaseComponent {
  constructor(
    gameService: GameService,
    levelService: LevelService,
    scoreService: ScoreService,
    musicService: MusicService,
    settingsService: SettingsService,
    difficultyService: DifficultyService
  ) {
    super(gameService, levelService, scoreService, musicService, settingsService, difficultyService);
  }

  generateCorrectSequence(): void {
    if (this.level === 1) {
      this.correctSequence = [this.gameService.getRandomNumberWithoutFive()];
      this.scoreService.resetScore(); // A pontszámot itt nullázzuk az Easy módban az első szinten
    } else {
      this.correctSequence.push(this.gameService.getRandomNumberWithoutFive());
    }
  }

  override resetGameState(): void {
    super.resetGameState();
    this.scoreService.resetScore(); // Győződjünk meg róla, hogy a pontszám is visszaáll
  }
}