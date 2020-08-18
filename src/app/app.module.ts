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


import { ArlasConfigurationDescriptor } from 'arlas-wui-toolkit/services/configuration-descriptor/configurationDescriptor.service';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, GestureConfig, MatPaginatorIntl } from '@angular/material';
import { AuthentificationService } from 'arlas-wui-toolkit/services/authentification/authentification.service';
import { OAuthModule } from 'angular-oauth2-oidc';
import { InputModalComponent } from '@shared-components/input-modal/input-modal.component';
import { LookAndFeelConfigModule } from '@look-and-feel-config/look-and-feel-config.module';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ArlasConfigurationUpdaterService } from 'arlas-wui-toolkit/services/configuration-updater/configurationUpdater.service';
import { FETCH_OPTIONS, CONFIG_UPDATER } from 'arlas-wui-toolkit/services/startup/startup.service';
import { ErrorModalModule } from 'arlas-wui-toolkit/components/errormodal/errormodal.module';
import { configUpdaterFactory, getOptionsFactory } from 'arlas-wui-toolkit/app.module';
import { GET_OPTIONS } from 'arlas-wui-toolkit/services/persistence/persistence.service';
import { ConfigMenuModule } from 'arlas-wui-toolkit/components/config-manager/config-menu/config-menu.module';
import { PaginatorI18n } from 'arlas-wui-toolkit/tools/paginatori18n';
import { UserInfosComponent } from 'arlas-wui-toolkit/components/user-infos/user-infos.component';

export function loadServiceFactory(defaultValuesService: DefaultValuesService) {
  const load = () => defaultValuesService.load('default.json?' + Date.now());
  return load;
}
export function startupServiceFactory(startupService: StartupService) {
  const init = () => startupService.init();
  return init;
}

export function auhtentServiceFactory(service: AuthentificationService) {
  return service;
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
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
    ErrorModalModule,
    MapConfigModule,
    SearchConfigModule,
    LookAndFeelConfigModule,
    ConfigMenuModule,
    SharedModule,
    TimelineConfigModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    LoggerModule.forRoot({
      level: environment.logLevel,
      disableConsoleLogging: false
    }),
    NgxSpinnerModule,
    AnalyticsConfigModule,
    OAuthModule.forRoot()
  ],
  providers: [
    forwardRef(() => ArlasConfigurationDescriptor),
    forwardRef(() => ArlasCollaborativesearchService),
    forwardRef(() => ArlasColorGeneratorLoader),
    forwardRef(() => ArlasStartupService),
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
      provide: 'AuthentificationService',
      useFactory: auhtentServiceFactory,
      deps: [AuthentificationService],
      multi: true
    },
    {
      provide: GET_OPTIONS,
      useFactory: getOptionsFactory,
      deps: [AuthentificationService]
    },
    {
      provide: ArlasWalkthroughService,
      useClass: WalkthroughService
    },
    {
      provide: ArlasConfigurationUpdaterService,
      useClass: ArlasConfigurationUpdaterService
    },
    { provide: FETCH_OPTIONS, useValue: {} },
    {
      provide: CONFIG_UPDATER,
      useValue: configUpdaterFactory
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: 2500, verticalPosition: 'top' }
    },
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: GestureConfig
    },
    {
      provide: GET_OPTIONS,
      useFactory: getOptionsFactory,
      deps: [AuthentificationService]
    },
    {
      provide: MatPaginatorIntl,
      deps: [TranslateService],
      useFactory: (translateService: TranslateService) => new PaginatorI18n(translateService).getPaginatorIntl()
    },
  ],
  bootstrap: [AppComponent],
  entryComponents: [LandingPageDialogComponent, InputModalComponent,
    UserInfosComponent]
})
export class AppModule { }
