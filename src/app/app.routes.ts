
import { Routes } from '@angular/router';
import { authRoutes } from './features/auth/auth.routes';
import { HomeComponent } from './features/game/components/home/home.component';
import { GameStartComponent } from './features/game/components/game-start/game-start.component';
import { SectionComponent } from './features/game/components/section/section.component';
import { ProfileComponent } from './features/game/components/profile/profile.component';
import { SettingsComponent } from './features/game/components/settings/settings.component';
import { DailyChallengeComponent } from './features/game/components/daily-challenge/daily-challenge.component';
import { AuthGuard } from './core/guards/auth.guard';


export const routes: Routes = [
  {
    path: 'auth',
    children: authRoutes
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: GameStartComponent }, // Alapértelmezett komponens a GameStartComponent
      {
        path: 'section', // A section most a home gyermeke
        component: SectionComponent,
        children: [
          { path: 'profile', component: ProfileComponent },
          { path: 'settings', component: SettingsComponent },
          { path: 'daily-challenge', component: DailyChallengeComponent }
        ]
      }
    ]
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
