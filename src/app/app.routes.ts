
import { Routes } from '@angular/router';
import { authRoutes } from './features/auth/auth.routes';
import { GameMainComponent } from './features/game/components/game-main/game-main.component';


export const routes: Routes = [
  {
    path: 'auth',
    children: authRoutes
  },
  {
    path: 'home',
    component: GameMainComponent,
 // 🔹 AuthGuard biztosítja a védett útvonalat
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
