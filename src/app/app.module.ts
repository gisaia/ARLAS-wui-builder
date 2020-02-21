import { NgModule, APP_INITIALIZER } from '@angular/core';
import {
  MatButtonModule, MatDialogModule, MatIconModule,
  MatListModule, MatSidenavModule, MatTooltipModule, MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS, GestureConfig
} from '@angular/material';
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingPageComponent, LandingPageDialogComponent } from '@components/landing-page/landing-page.component';
import { LeftMenuComponent } from '@components/left-menu/left-menu.component';
import { PageNotFoundComponent } from '@components/page-not-found/page-not-found.component';
import { MapConfigModule } from '@map-config/map-config.module';
import { SearchConfigModule } from '@search-config/search-config.module';
import { TimelineConfigModule } from '@timeline-config/timeline-config.module';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { HttpClientModule } from '@angular/common/http';
import { environment } from 'environments/environment';
import { LoggerModule } from 'ngx-logger';
import { ArlasToolKitModule } from 'arlas-wui-toolkit';

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
    ArlasToolKitModule,
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
    TimelineConfigModule,
    LoggerModule.forRoot({
      level: environment.logLevel,
      disableConsoleLogging: false
    })
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: loadServiceFactory,
      deps: [DefaultValuesService],
      multi: true
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: 2500, verticalPosition: 'top' }
    },
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: GestureConfig
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [LandingPageDialogComponent]
})
export class AppModule { }
