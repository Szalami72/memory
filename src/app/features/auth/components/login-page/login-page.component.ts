import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginButtonsComponent } from '../login-buttons/login-buttons.component'; // Ellenőrizd az elérési utat!

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, LoginButtonsComponent], // Fontos az imports tömb!
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {

}
