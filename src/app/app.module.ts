import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LeftMenuComponent } from './components/left-menu/left-menu.component';
import { MatSidenavModule } from '@angular/material/sidenav'; 
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon'; 
import { MatListModule } from '@angular/material/list'; 
import {MatTooltipModule} from '@angular/material/tooltip';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import {MatButtonModule} from '@angular/material/button';
import { MapConfigModule } from './modules/map-config/map-config.module';
import { TimelineConfigModule } from './modules/timeline-config/timeline-config.module';
import { SearchConfigModule } from './modules/search-config/search-config.module';

@NgModule({
  declarations: [
    AppComponent,
    LeftMenuComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatSidenavModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule,
    MatButtonModule,
    MapConfigModule,
    TimelineConfigModule,
    SearchConfigModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
