import { Routes } from '@angular/router';
import { LoginPageComponent } from './components/login-page/login-page.component'; // Importáld a LoginPageComponent-et!


export const authRoutes: Routes = [
  {
    path: 'login', // Az útvonal elérési útja: /auth/login
    component: LoginPageComponent // A LoginPageComponent-et jeleníti meg
  },
];