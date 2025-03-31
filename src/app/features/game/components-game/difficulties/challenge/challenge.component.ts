import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
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
export class ChallengeComponent extends GameBaseComponent implements OnInit {

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

  override ngOnInit(): void {
    this.settingsSubscription = this.settingsService.userSettings$.subscribe(settings => {
      this.colorSetting = settings.colorsSetting ?? true;
      this.soundSetting = settings.soundSetting ?? true;
      // Itt nem kell a musicService-t külön értesíteni, mert az is fel van iratkozva
    });
    this.difficulty = this.difficultyService.difficulty;
    console.log('Difficulty:', this.difficulty);
    // A MusicService konstruktora már gondoskodik az előtöltésről, ha ott hívod meg
    // this.musicService.preloadSounds();
    this.resetGameState();
    this.demonstrateSounds();
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
    async demonstrateSounds(): Promise<void> {
      this.canClick = false; // Ne lehessen kattintani a bemutató alatt
      await this.delay(500); // Kis szünet az oldal betöltése után
  
      const numberOfSquares = this.squares.length;
      for (let i = 1; i <= numberOfSquares; i++) {
        const index = i - 1;
        const squareElement = this.squares?.toArray()[index]?.nativeElement;
  
        if (squareElement) {
          this.playSound(i); // Hang lejátszása
  
          const originalClass = squareElement.className.replace(' glow', '');
          const idleClass = originalClass.split(' ').find((cls: string) => cls.endsWith('-idle'));
  
          if (idleClass) {
            const activeClass = idleClass.replace('-idle', '');
            squareElement.className = originalClass.replace(idleClass, activeClass) + ' glow';
            await this.delay(600); // Villantás időtartama
  
            squareElement.className = originalClass;
            await this.delay(300); // Szünet a négyzetek között
          } else {
            console.warn(`demonstrateSounds: Nem található '-idle' osztály a(z) ${index} indexű négyzeten.`);
          }
        } else {
          console.warn(`demonstrateSounds: A(z) ${index} indexű négyzet nem található.`);
        }
        if (!this.isGameRunning) return; // Kilépés, ha a játék közben leállt
      }
  
      // A bemutató után indítsuk el a játékot
      if (this.isGameRunning) {
        this.startCountdown();
      }
    }

}

