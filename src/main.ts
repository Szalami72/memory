import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';

import { AppComponent } from './app/app.component';
import { environment } from './app/environments/environment';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AuthService } from './app/core/services/auth.service';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { authRoutes } from './app/features/auth/auth.routes';
import { RouterModule, Routes } from '@angular/router';
import { GameMainComponent } from './app/features/game/components/game-main/game-main.component';

export const routes: Routes = [
  {
    path: 'auth',
    children: authRoutes
  },
  {
    path: 'home',
    component: GameMainComponent
  },
  {
    path: '',
    component: AppComponent
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

bootstrapApplication(AppComponent, {
  providers: [
    
     importProvidersFrom(AngularFireModule.initializeApp(environment.firebase)), // 🔹 AngularFireModule külön importProvidersFrom hívásban
     importProvidersFrom(RouterModule.forRoot(routes)), // 🔹 RouterModule külön importProvidersFrom hívásban
     provideFirebaseApp(() => initializeApp(environment.firebase)),
     provideAuth(() => getAuth()),
     AuthService
    ]
}).catch(err => console.error(err));