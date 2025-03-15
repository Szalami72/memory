import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DifficultyService } from '../../services/difficulty.service';

@Component({
  selector: 'app-game-start',
  standalone: true,
  templateUrl: './game-start.component.html',
  styleUrls: ['./game-start.component.css']
})
export class GameStartComponent {
  constructor(
    private router: Router,
    private difficultyService: DifficultyService
  ) {}

  startGame(difficulty: string): void {
    // Tároljuk el a kiválasztott nehézséget a szolgáltatásban
    this.difficultyService.difficulty = difficulty;
    // Navigálunk a játék komponenshez (itt akár query paraméter is lehet, vagy csak egy új komponens betöltése)
    this.router.navigate(['/game/' + difficulty]);
  }
}
