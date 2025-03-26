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
  selector: 'app-hard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: '../../../../../shared/html/difficulties.html',
  styleUrls: ['./hard.component.css', '../../../../../shared/styles/difficulties.css']
})
export class HardComponent extends GameBaseComponent {
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
    this.correctSequence = this.gameService.getMultyRandomNumberWithoutFive(this.level);
  }

  override startCountdown(): void {
    // A pontszámot itt nullázzuk a Hard módban a visszaszámláláskor
    this.scoreService.resetScore();
    super.startCountdown();
  }

  // Esetleg más, hard módra specifikus logika is ide kerülhet
}