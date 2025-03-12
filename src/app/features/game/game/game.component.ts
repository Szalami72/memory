import { Component, OnInit } from '@angular/core';
import { DifficultyService } from '../services/difficulty.service';

@Component({
  selector: 'app-game',
  standalone: true,
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  difficulty: string = '';

  constructor(private difficultyService: DifficultyService) {}

  ngOnInit(): void {
    this.difficulty = this.difficultyService.difficulty;
    console.log('Kiválasztott nehézségi szint:', this.difficulty);
    // A játék logikája itt indulhat a megfelelő nehézségi szint alapján
  }
}


// header: kilépés gomb, pontszám kijelzése, egyéni rekord az adott nehézségi szinten
// scene: játéktér, játékelemek, játékos irányítása
// footer: nehézségi szint kijelzése
