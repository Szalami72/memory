import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginButtonsComponent } from './features/auth/components/login-buttons/login-buttons.component'; // Importáld a LoginButtonsComponent-et!

@Component({
  selector: 'app-root',
  standalone: true, // Valószínűleg már standalone, ha nem, add hozzá
  imports: [RouterOutlet,], // Add hozzá a LoginButtonsComponent-et az imports tömbhöz!
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'memory_game';
}
