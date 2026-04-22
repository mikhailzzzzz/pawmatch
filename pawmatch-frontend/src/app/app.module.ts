import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';

// i18n
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Pages
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { SwipeComponent } from './pages/swipe/swipe.component';
import { MatchesComponent } from './pages/matches/matches.component';
import { PetListComponent } from './pages/pets/pet-list.component';
import { PetDetailComponent } from './pages/pets/pet-detail.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SheltersComponent } from './pages/shelters/shelters.component';

// Standalone components
import { AboutComponent } from './pages/about/about.component';
import { FooterComponent } from './shared/footer/footer.component';
import { HelpComponent } from './pages/help/help.component';
import { AdminComponent } from './pages/admin/admin.component';

// Core
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    SwipeComponent,
    MatchesComponent,
    PetListComponent,
    PetDetailComponent,
    ProfileComponent,
    SheltersComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    AboutComponent,
    FooterComponent,
    HelpComponent,
    AdminComponent,
    TranslateModule.forRoot({
      loader: provideTranslateHttpLoader({
        prefix: 'assets/i18n/',
        suffix: '.json'
      })
    })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
