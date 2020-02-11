import { NgModule } from '@angular/core';
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
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [LandingPageDialogComponent]
})
export class AppModule { }
