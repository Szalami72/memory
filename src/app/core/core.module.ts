import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AngularFireAuthModule
  ],
  providers: [
    AuthService
  ]
})
export class CoreModule { 
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only.');
    } 
  }

  static forRoot() {
    return {
      ngModule: CoreModule,
      providers: [],
    };
  }
}
