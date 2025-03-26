import { Component, OnInit, OnDestroy, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { GameService } from '../../../services/game.service';
import { LevelService } from '../../../services/level.service';
import { ScoreService } from '../../../services/score.service';
import { MusicService } from '../../../services/music.service';
import { SettingsService } from '../../../services/settings.service';
import { DifficultyService } from '../../../services/difficulty.service';

@Component({
  selector: 'app-game-base', // Ne felejtsd el, hogy ez egy absztrakt komponens lesz, lehet, hogy nem is kell selector
  standalone: true,
  imports: [CommonModule],
  template: '', // Lehet, hogy nincs saját template-je
  styleUrl: './game-base.component.css' // Lehet, hogy nincsen saját stílusa
})
export abstract class GameBaseComponent implements OnInit, OnDestroy {
  countdown: number | string = 3;
  countdownInterval: any;
  isCountingDown: boolean = true;

  correctSequence: number[] = [];
  userSequence: number[] = [];
  clickIndex: number = 0;
  canClick: boolean = false;
  isFailed: boolean = false;
  isNextLevel: boolean = false;
  finalScore: number = 0;
  isNewBestScore: boolean = false;

  isGameRunning = true;

  level: number = 1;
  lastCorrectClickTime: number | null = null;
  MAX_CLICK_TIME_WINDOW: number = 2000; // 2 másodperc

  colorSetting: boolean = true; //színek vagy ábrák
  soundSetting: boolean = true;

  difficulty: string = '';

  private gameTimeout: any;
  private settingsSubscription: Subscription | null = null;

  @ViewChildren('square') squares!: QueryList<ElementRef>;

  // Gyors kattintások kezeléséhez
  clickQueue: number[] = [];
  isProcessingClick: boolean = false;

  constructor(
    public gameService: GameService,
    public levelService: LevelService,
    public scoreService: ScoreService,
    public musicService: MusicService,
    public settingsService: SettingsService,
    public difficultyService: DifficultyService
  ) { }

  ngOnInit(): void {
    this.settingsSubscription = this.settingsService.userSettings$.subscribe(settings => {
      this.colorSetting = settings.colorsSetting ?? true;
      this.soundSetting = settings.soundSetting ?? true;
    });
    this.difficulty = this.difficultyService.difficulty;
    console.log('Difficulty:', this.difficulty);
    this.musicService.preloadSounds();
    this.resetGameState();
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
    clearInterval(this.countdownInterval);
    clearTimeout(this.gameTimeout);
    this.isGameRunning = false;
  }

  startCountdown(): void {
    this.canClick = false;
    this.countdownInterval = setInterval(() => {
      if (typeof this.countdown === 'number') {
        this.countdown--;
        if (this.countdown < 1) {
          this.countdown = 'Start';
          clearInterval(this.countdownInterval);
          setTimeout(() => {
            this.isCountingDown = false;
            this.startGame();
          }, 1000);
        }
      }
    }, 1000);
  }

  abstract generateCorrectSequence(): void;

  async startGame(): Promise<void> {
    this.levelService.setLevel(this.level);
    this.isFailed = false;
    this.lastCorrectClickTime = null;
    this.userSequence = [];
    this.clickIndex = 0;
    this.clickQueue = [];
    this.isProcessingClick = false;
    this.canClick = false;
    await this.delay(1000);

    this.generateCorrectSequence();

    await this.highlightSequence();
    this.canClick = true;
  }

  async highlightSequence(): Promise<void> {
    for (const value of this.correctSequence) {
      if (!this.isGameRunning) {
        return;
      }
      const index = value - 1;
      this.playSound(value);

      const squareElement = this.squares.toArray()[index]?.nativeElement;
      if (!squareElement) continue;
      const originalClass = squareElement.className;
      const idleClass = originalClass.split(' ').find((cls: string) => cls.endsWith('-idle'));
      if (idleClass) {
        const activeClass = idleClass.replace('-idle', '');
        squareElement.className = originalClass.replace(idleClass, activeClass);
        await this.delay(1000);
        squareElement.className = originalClass;
        await this.delay(500);
      }
    }
  }

  onSquareClick(clickedValue: number): void {
    if (!this.canClick || this.isFailed) return;

    const index = clickedValue - 1;
    const squareElement = this.squares.toArray()[index]?.nativeElement;
    if (!squareElement) return;

    const originalClass = squareElement.className;
    const idleClass = originalClass.split(' ').find((cls: string) => cls.endsWith('-idle'));

    if (idleClass) {
      const activeClass = idleClass.replace('-idle', '');
      this.playSound(clickedValue);

      squareElement.className = originalClass.replace(idleClass, activeClass);

      setTimeout(() => {
        squareElement.className = originalClass;
      }, 500);
    }

    this.clickQueue.push(clickedValue);

    if (!this.isProcessingClick) {
      this.processNextClick();
    }
  }

  async processNextClick(): Promise<void> {
    if (this.clickQueue.length === 0) {
      this.isProcessingClick = false;
      return;
    }
    this.isProcessingClick = true;
    const clickedValue = this.clickQueue.shift()!;
    const expectedValue = this.correctSequence[this.clickIndex];
    const clickedSquare = this.squares.toArray()[clickedValue - 1]?.nativeElement;
    if (!clickedSquare) {
      this.isProcessingClick = false;
      this.processNextClick();
      return;
    }
    if (clickedValue === expectedValue) {
      this.userSequence.push(clickedValue);
      this.clickIndex++;
      this.updateScore();
      clickedSquare.classList.add('correct');
      await this.delay(300);
      clickedSquare.classList.remove('correct');

      if (this.userSequence.length === this.correctSequence.length) {
        this.canClick = false;
        this.advanceLevel();
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
    if (this.clickQueue.length > 0 && this.canClick && !this.isFailed) {
      this.processNextClick();
    }
  }

  updateScore(): void {
    const currentTime = Date.now();
    let score = 100;
    if (this.lastCorrectClickTime !== null) {
      const elapsedTime = currentTime - this.lastCorrectClickTime;
      if (elapsedTime < this.MAX_CLICK_TIME_WINDOW) {
        const remainingTime = this.MAX_CLICK_TIME_WINDOW - elapsedTime;
        score = Math.round(100 * (1 + remainingTime / this.MAX_CLICK_TIME_WINDOW));
      }
    }
    this.scoreService.incrementScore(score);
    this.lastCorrectClickTime = currentTime;
  }

  advanceLevel(): void {
    this.isNextLevel = true;
    this.level++;
    this.levelService.setLevel(this.level);
    setTimeout(() => {
      this.isNextLevel = false;
      this.startGame();
    }, 1500);
  }

  failGame(clickedSquare: any): void {
    this.isFailed = true;
    this.canClick = false;
    clickedSquare.classList.add('incorrect');
    this.finalScore = this.scoreService.getScore();
    this.isNewBestScore = this.scoreService.checkPreviousBestScore(this.finalScore, this.difficulty);
    setTimeout(() => {
      clickedSquare.classList.remove('incorrect');
    }, 1000);
  }

  resetGameState(): void {
    this.countdown = 3;
    this.isCountingDown = true;
    this.correctSequence = [];
    this.userSequence = [];
    this.clickIndex = 0;
    this.canClick = false;
    this.isFailed = false;
    this.isNextLevel = false;
    this.level = 1;
    this.lastCorrectClickTime = null;
    this.clickQueue = [];
    this.isProcessingClick = false;
  }

  startNewGame(): void {
    this.resetGameState();
    this.levelService.setLevel(this.level);
    this.scoreService.resetScore();
    this.startCountdown();
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  playSound(value: number): void {
    this.musicService.playSound(value);
  }
}
