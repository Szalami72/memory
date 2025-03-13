import { Component, OnInit } from '@angular/core';

import { HeaderGameComponent } from '../header-game/header-game.component';
import { SceneGameComponent } from '../scene-game/scene-game.component';
import { FooterGameComponent } from '../footer-game/footer-game.component';



@Component({
  selector: 'app-game',
  standalone: true,
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.css'],
  imports: [HeaderGameComponent, SceneGameComponent, FooterGameComponent]
})
export class FrameComponent  {

  constructor() {}

  
}


// header: kilépés gomb, pontszám kijelzése, egyéni rekord az adott nehézségi szinten
// scene: játéktér, játékelemek, játékos irányítása
// footer: nehézségi szint kijelzése


