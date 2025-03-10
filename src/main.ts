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
import { RouterModule } from '@angular/router';
import { routes } from './app/app.routes'; // ✅ Importáld a helyes routes-t az app.routes.ts-ből!


bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(AngularFireModule.initializeApp(environment.firebase)),
        importProvidersFrom(RouterModule.forRoot(routes)), // ✅ Használd az importált routes-t!
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideAuth(() => getAuth()),
        AuthService
    ]
}).catch(err => console.error(err));