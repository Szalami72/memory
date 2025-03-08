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

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(AngularFireModule.initializeApp(environment.firebase)),
    provideFirebaseApp(() => initializeApp(environment.firebase)), // 🔹 Firebase inicializálása
    provideAuth(() => getAuth()), // 🔹 Auth provider hozzáadása
    AuthService
  ]
}).catch(err => console.error(err));