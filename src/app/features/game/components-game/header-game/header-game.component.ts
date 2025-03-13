import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { DifficultyService } from '../../services/difficulty.service';

@Component({
  selector: 'app-header-game',
  standalone: true,
  imports: [],
  templateUrl: './header-game.component.html',
  styleUrl: './header-game.component.css'
})
export class HeaderGameComponent {
  difficulty: string = '';

  progress = 0; // 0-100%-os progress érték
  pressTimer: any = null;
  pressStartTime: number = 0;
  holdDuration = 1000; // 2000 ms = 2 másodperc
 
  constructor(private router: Router, private difficultyService: DifficultyService) { }

  ngOnInit(): void {
    this.difficulty = this.difficultyService.difficulty;
    console.log('Kiválasztott nehézségi szint:', this.difficulty);
    // A játék logikája itt indulhat a megfelelő nehézségi szint alapján
  }
 
 startPress(): void {
    this.pressStartTime = Date.now();
    this.progress = 0;
    // 50ms-es intervallummal frissítjük a progress értékét
    this.pressTimer = setInterval(() => {
      const elapsed = Date.now() - this.pressStartTime;
      this.progress = Math.min(100, (elapsed / this.holdDuration) * 100);
      if (elapsed >= this.holdDuration) {
        this.backToStartPage();
        this.endPress();
      }
    }, 50);
  }

  endPress(): void {
    if (this.pressTimer) {
      clearInterval(this.pressTimer);
      this.pressTimer = null;
    }
    this.progress = 0;
  }

  backToStartPage(): void {
    // Itt valósítsd meg a navigációt, például:
    this.router.navigate(['/home']);
    // Vagy bármilyen logikát, ami visszavezeti a játék kezdőoldalára.
    console.log('Kilépés végrehajtva, navigálás a kezdőoldalra.');
  }
}

