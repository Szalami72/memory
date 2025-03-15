import { Component, OnInit, OnDestroy,  ElementRef, QueryList, ViewChildren } from '@angular/core';
import { GameService } from '../../../services/game.service';
import { LevelService } from '../../../services/level.service';
import { CommonModule } from '@angular/common'; // Szükséges az *ngIf-hez

@Component({
  selector: 'app-scene-game',
  standalone: true,
  imports: [CommonModule], // Add hozzá a CommonModule-t
  templateUrl: './easy.component.html',
  styleUrl: './easy.component.css'
})
export class EasyComponent implements OnInit, OnDestroy {
  countdown: number | string = 3;
  countdownInterval: any;
  isCountingDown: boolean = true;

  tilesArray: number[] = [];
  correctSequence: number[] = [];
  userSequence: number[] = [];
  clickIndex: number = 0; // A felhasználó aktuális kattintásának indexe
  canClick: boolean = false; // Jelzi, hogy a felhasználó kattinthat-e
  isFailed: boolean = false; // Jelzi, hogy a játék elveszett-e
  isNextLevel: boolean = false; 

  level: number = 1;

  private gameTimeout: any;
  
  @ViewChildren('square') squares!: QueryList<ElementRef>;

  constructor(public gameService: GameService, public levelService: LevelService) { }

  ngOnInit(): void {
    this.tilesArray = [];
    this.tilesArray = [];
    this.correctSequence = [];
    this.userSequence = [];
    this.clickIndex = 0;
    this.canClick = false;
    this.isFailed = false; // Inicializáljuk a játék elején
    this.isNextLevel = false;
    this.levelService.setLevel(this.level);
    

    this.startCountdown();
  }

  ngOnDestroy(): void {
    clearInterval(this.countdownInterval);
    clearTimeout(this.gameTimeout); // Fontos a timeout törlése is
  }

  startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      if (typeof this.countdown === 'number') {
        this.countdown--;
        if (this.countdown < 1) {
          this.countdown = 'Start'; // Ha eléri a 0-t, állítsd 'Start'-ra
          setTimeout(() => {
            this.isCountingDown = false; // Kicsit később tüntesd el a visszaszámlálást
            clearInterval(this.countdownInterval); // Állítsd le az intervallumot
            this.startGame();
          }, 100); // Például 1 másodperc múlva tűnjön el a 'Start'
        }
      }
    }, 100); // 1000 milliszekundum = 1 másodperc
  }

  async startGame(): Promise<void> {
    this.levelService.setLevel(this.level); 
    this.isFailed = false;
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (this.level === 1) {
            this.correctSequence = [this.gameService.getRandomNumberWithoutFive()];
          } else {
            this.correctSequence.push(this.gameService.getRandomNumberWithoutFive());
          }

    this.userSequence = [];
    this.clickIndex = 0;
    this.canClick = false;

    for (const value of this.correctSequence) { // Highlight based on the generated sequence
      const index = value - 1;
      if (this.squares && this.squares.toArray().length > index && index >= 0) {
        const squareElement = this.squares.toArray()[index].nativeElement;
        const originalClassName = squareElement.className;
        const idleClassToRemove = originalClassName.split(' ').find((className: string) => className.endsWith('-idle'));

        if (idleClassToRemove) {
          const activeClass = idleClassToRemove.replace('-idle', '');
          squareElement.className = originalClassName.replace(idleClassToRemove, activeClass);

          await new Promise(resolve => setTimeout(resolve, 1000));

          squareElement.className = originalClassName;

          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    this.canClick = true;
  }

  onSquareClick(clickedValue: number): void {
    if (!this.canClick || this.isFailed) {
      return;
    }

    const expectedValue = this.correctSequence[this.clickIndex];
    const clickedSquare = this.squares.toArray()[clickedValue - 1].nativeElement;

    if (clickedValue === expectedValue) {
      this.userSequence.push(clickedValue);
      this.clickIndex++;

      clickedSquare.classList.add('correct');
      setTimeout(() => {
        clickedSquare.classList.remove('correct');
      }, 300);

      if (this.userSequence.length === this.correctSequence.length) {
        this.canClick = false;
        console.log('Helyes sorozat! Jelenlegi szint:', this.level);
        this.isNextLevel = true;
        this.level++;
        this.levelService.setLevel(this.level); 
        setTimeout(() => {
          this.isNextLevel = false;
          this.startGame();
        }, 1500);
      }
    } else {
      this.isFailed = true;
      this.canClick = false;
      console.log('Hibás kattintás! Fail! Elért szint:', this.level);
      clickedSquare.classList.add('incorrect');
      setTimeout(() => {
        clickedSquare.classList.remove('incorrect');
      }, 1000);
    }
  }

  startNewGame(): void {
    this.isFailed = false;
    this.userSequence = [];
    this.clickIndex = 0;
    this.levelService.setLevel(this.level);
    this.startGame();
  }
}
