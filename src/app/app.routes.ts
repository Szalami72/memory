
import { Routes } from '@angular/router';
import { authRoutes } from './features/auth/auth.routes';
import { HomeComponent } from './features/game/components/home/home.component';
import { AuthGuard } from './core/guards/auth.guard';


export const routes: Routes = [
  {
    path: 'auth',
    children: authRoutes
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard]

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
