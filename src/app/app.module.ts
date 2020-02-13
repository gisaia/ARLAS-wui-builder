import { NgModule, APP_INITIALIZER } from '@angular/core';
import {
  MatButtonModule, MatDialogModule, MatIconModule,
  MatListModule, MatSidenavModule, MatTooltipModule, MatSnackBarModule
} from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingPageComponent, LandingPageDialogComponent } from './components/landing-page/landing-page.component';
import { LeftMenuComponent } from './components/left-menu/left-menu.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { MapConfigModule } from './modules/map-config/map-config.module';
import { SearchConfigModule } from './modules/search-config/search-config.module';
import { TimelineConfigModule } from './modules/timeline-config/timeline-config.module';
import { DefaultValuesService } from './services/default-values/default-values.service';
import { HttpClientModule } from '@angular/common/http';

export function loadServiceFactory(defaultValuesService: DefaultValuesService) {
  const load = () => defaultValuesService.load('default.json?' + Date.now());
  return load;
}

@NgModule({
  declarations: [
    AppComponent,
    LeftMenuComponent,
    PageNotFoundComponent,
    LandingPageComponent,
    LandingPageDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MapConfigModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTooltipModule,
    SearchConfigModule,
    TimelineConfigModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: loadServiceFactory,
      deps: [DefaultValuesService],
      multi: true
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [LandingPageDialogComponent]
})
export class AppModule { }
