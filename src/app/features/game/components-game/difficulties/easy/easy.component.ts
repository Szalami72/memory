import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameService } from '../../../services/game.service';
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

  constructor(public gameService: GameService) { }

  ngOnInit(): void {
    this.tilesArray = [];
    this.startCountdown();
  }

  ngOnDestroy(): void {
    clearInterval(this.countdownInterval); // Fontos a timer leállítása a komponens megsemmisülésekor
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
          }, 1000); // Például 1 másodperc múlva tűnjön el a 'Start'
        }
      }
    }, 1000); // 1000 milliszekundum = 1 másodperc
  }

  startGame(): void {
    console.log('Start the game!');
    this.tilesArray.push(this.gameService.getRandomNumberWithoutFive());
    console.log('Random numbers:', this.tilesArray);
    this.tilesArray.push(this.gameService.getRandomNumberWithoutFive());
    console.log('Random numbers:', this.tilesArray);
    this.tilesArray.push(this.gameService.getRandomNumberWithoutFive());
    console.log('Random numbers:', this.tilesArray);
    this.tilesArray.push(this.gameService.getRandomNumberWithoutFive());
    console.log('Random numbers:', this.tilesArray);
    this.tilesArray.push(this.gameService.getRandomNumberWithoutFive());
    console.log('Random numbers:', this.tilesArray);
    this.tilesArray.push(this.gameService.getRandomNumberWithoutFive());
    console.log('Random numbers:', this.tilesArray);
   
  }
}