import { Routes } from '@angular/router';
import { authRoutes } from './features/auth/auth.routes';
import { HomeComponent } from './features/game/components/home/home.component';
import { GameStartComponent } from './features/game/components/game-start/game-start.component';
import { FrameComponent } from './features/game/components-game/frame/frame.component';
import { ProfileComponent } from './features/game/components/profile/profile.component';
import { SettingsComponent } from './features/game/components/settings/settings.component';
import { DailyChallengeComponent } from './features/game/components/daily-challenge/daily-challenge.component';
import { EasyComponent } from './features/game/components-game/difficulties/easy/easy.component';
import { HardComponent } from './features/game/components-game/difficulties/hard/hard.component';
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
      // Alapértelmezett útvonal: a játék indítása (pl. nehézségi szint kiválasztása)
      { path: '', component: GameStartComponent },
      { path: 'profile', component: ProfileComponent },
          { path: 'settings', component: SettingsComponent },
          { path: 'daily-challenge', component: DailyChallengeComponent },
    ]
  },
  { 
    path: 'game', component: FrameComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'easy', component: EasyComponent, runGuardsAndResolvers: 'always' },
      { path: 'hard', component: HardComponent, runGuardsAndResolvers: 'always' },
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
