/*
Licensed to Gisaïa under one or more contributor
license agreements. See the NOTICE.txt file distributed with
this work for additional information regarding copyright
ownership. Gisaïa licenses this file to you under
the Apache License, Version 2.0 (the "License"); you may
not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/
import { NgModule, APP_INITIALIZER, forwardRef } from '@angular/core';
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
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { LoggerModule } from 'ngx-logger';
import {
  ArlasCollaborativesearchService, ArlasStartupService,
  ArlasColorGeneratorLoader
} from 'arlas-wui-toolkit';
import { SharedModule } from '@shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { StartupService } from '@services/startup/startup.service';
import { ArlasWalkthroughService } from 'arlas-wui-toolkit/services/walkthrough/walkthrough.service';
import { WalkthroughService } from '@services/walkthrough/walkthrough.service';
import { AnalyticsConfigModule } from './modules/analytics-config/analytics-config.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { CustomTranslateLoader } from 'arlas-wui-toolkit/shared.module';
import { ArlasConfigurationDescriptor } from 'arlas-wui-toolkit/services/configuration-descriptor/configurationDescriptor.service';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, GestureConfig } from '@angular/material';

export function loadServiceFactory(defaultValuesService: DefaultValuesService) {
  const load = () => defaultValuesService.load('default.json?' + Date.now());
  return load;
}
export function startupServiceFactory(startupService: StartupService) {
  const init = () => startupService.init();
  return init;
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
    MapConfigModule,
    SearchConfigModule,
    SharedModule,
    TimelineConfigModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: CustomTranslateLoader,
        deps: [HttpClient]
      }
    }),
    LoggerModule.forRoot({
      level: environment.logLevel,
      disableConsoleLogging: false
    }),
    NgxSpinnerModule,
    AnalyticsConfigModule
  ],
  providers: [
    forwardRef(() => ArlasConfigurationDescriptor),
    forwardRef(() => ArlasCollaborativesearchService),
    forwardRef(() => ArlasColorGeneratorLoader),
    {
      provide: APP_INITIALIZER,
      useFactory: loadServiceFactory,
      deps: [DefaultValuesService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: startupServiceFactory,
      deps: [StartupService],
      multi: true
    },
    {
      provide: ArlasWalkthroughService,
      useClass: WalkthroughService
    },
    {
      provide: ArlasStartupService,
      useClass: StartupService
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
