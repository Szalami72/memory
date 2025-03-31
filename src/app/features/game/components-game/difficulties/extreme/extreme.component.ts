import { Component,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameBaseComponent } from '../game-base/game-base.component';
import { GameService } from '../../../services/game.service';
import { LevelService } from '../../../services/level.service';
import { ScoreService } from '../../../services/score.service';
import { MusicService } from '../../../services/music.service';
import { SettingsService } from '../../../services/settings.service';
import { DifficultyService } from '../../../services/difficulty.service';
import { ElementRef } from '@angular/core';

@Component({
  selector: 'app-extreme',
  standalone: true,
  imports: [CommonModule],
  templateUrl: '../../../../../shared/html/difficulties.html',
  styleUrls: ['./extreme.component.css', '../../../../../shared/styles/difficulties.css']
})
export class ExtremeComponent extends GameBaseComponent {

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
    this.correctSequence = this.gameService.getMultyRandomNumberWithoutFive(this.level);
  }

  override async processNextClick(): Promise<void> {
    
    if (this.clickQueue.length === 0) {
      this.isProcessingClick = false;
      return;
    }
    this.isProcessingClick = true;
    const clickedValue = this.clickQueue.shift()!;
    // **Módosítás itt:** A várt érték a correctSequence tömb végéről jön visszafelé
    const expectedValue = this.correctSequence[this.correctSequence.length - 1 - this.clickIndex];
    const clickedSquare = this.squares.toArray()[clickedValue - 1]?.nativeElement;
    if (!clickedSquare) {
      this.isProcessingClick = false;
      this.processNextClick();
      return;
    }
    // Frissítjük az állapotot azonnal
    if (clickedValue === expectedValue) {
      this.userSequence.push(clickedValue);
      this.clickIndex++;
      this.updateScore();
      clickedSquare.classList.add('corect');
      await this.delay(300);

      if (this.userSequence.length === this.correctSequence.length) {
        // Ha a sorozat teljes, letiltjuk a további kattintásokat és szintváltunk
        this.canClick = false;
        this.advanceLevel();
        // Töröljük a queue-t, mert a sorozat végeztével nem érdekelnek további kattintások
        this.clickQueue = [];
        this.isProcessingClick = false;
        return;
      }
    } else {
      this.failGame(clickedSquare);
      this.clickQueue = [];
      this.isProcessingClick = false;
      return;
    }
    this.isProcessingClick = false;
    // Ha maradt még kattintás a queue-ban, folytatjuk a feldolgozást
    if (this.clickQueue.length > 0 && this.canClick && !this.isFailed) {
      this.processNextClick();
    }
  }
}