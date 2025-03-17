import { Component, OnInit, OnDestroy, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { GameService } from '../../../services/game.service';
import { LevelService } from '../../../services/level.service';
import { ScoreService } from '../../../services/score.service';
import { MusicService } from '../../../services/music.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scene-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './easy.component.html',
  styleUrl: './easy.component.css'
})
export class EasyComponent implements OnInit, OnDestroy {
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

  private gameTimeout: any;
  
  @ViewChildren('square') squares!: QueryList<ElementRef>;

  // Gyors kattintások kezeléséhez
  clickQueue: number[] = [];
  isProcessingClick: boolean = false;

  constructor(public gameService: GameService,
     public levelService: LevelService,
      public scoreService: ScoreService,
      private musicService: MusicService) {}

  ngOnInit(): void {
    this.resetGameState();
    this.startCountdown();
  }

  ngOnDestroy(): void {
    clearInterval(this.countdownInterval);
    clearTimeout(this.gameTimeout);
    this.isGameRunning = false;
  }

  startCountdown(): void {
    // Visszaszámlálás alatt ne lehessen kattintani
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

  async startGame(): Promise<void> {
    this.levelService.setLevel(this.level);
    this.isFailed = false;
    this.lastCorrectClickTime = null;
    this.userSequence = [];
    this.clickIndex = 0;
    // Ürítjük a queue-t, illetve leállítjuk az esetleges folyamatban lévő kattintásfeldolgozást
    this.clickQueue = [];
    this.isProcessingClick = false;
    this.canClick = false;
    await this.delay(1000);

    if (this.level === 1) {
      this.correctSequence = [this.gameService.getRandomNumberWithoutFive()];
      this.scoreService.resetScore();
    } else {
      this.correctSequence.push(this.gameService.getRandomNumberWithoutFive());
    }

    await this.highlightSequence();
    // Miután a sorozat kijelző animációja véget ért, engedélyezzük a kattintásokat
    this.canClick = true;
  }

  async highlightSequence(): Promise<void> {
    for (const value of this.correctSequence) {

      if (!this.isGameRunning) {
        return;  // Ha a játék már nem fut, akkor kilépünk
      }
      const index = value - 1;
      const squareElement = this.squares.toArray()[index]?.nativeElement;
      if (!squareElement) continue;
      const originalClass = squareElement.className;
      const idleClass = originalClass.split(' ').find((cls: string) => cls.endsWith('-idle'));
      this.playSound(value);
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

    this.playSound(clickedValue);

    // A kattintást hozzáadjuk a queue-hoz
    this.clickQueue.push(clickedValue);
    // Ha nincs éppen folyamatban kattintás feldolgozás, elindítjuk
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
    // Frissítjük az állapotot azonnal
    if (clickedValue === expectedValue) {
      this.userSequence.push(clickedValue);
      this.clickIndex++;
      this.updateScore();
      // Azonnali vizuális visszajelzés
      clickedSquare.classList.add('correct');
      // Várunk a visszajelzés animációjára
      await this.delay(300);
      clickedSquare.classList.remove('correct');

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
    
    // Ellenőrizzük, hogy új rekordot ért el a játékos
    this.isNewBestScore = this.scoreService.checkPreviousBestScore(this.finalScore, 'easy');
  
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

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  
  playSound(value: number): void {
    this.musicService.playSound(`../../../../../assets/sounds/${value}.mp3`);
  }
  
}
