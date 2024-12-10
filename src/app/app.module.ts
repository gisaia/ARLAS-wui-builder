/*
 * Licensed to Gisaïa under one or more contributor
 * license agreements. See the NOTICE.txt file distributed with
 * this work for additional information regarding copyright
 * ownership. Gisaïa licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { HttpClient } from '@angular/common/http';
import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, forwardRef, NgModule } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LandingPageComponent, } from '@components/landing-page/landing-page.component';
import { LandingPageDialogComponent } from '@components/landing-page/landing-page-dialog.component';
import { LeftMenuComponent } from '@components/left-menu/left-menu.component';
import { LookAndFeelConfigModule } from '@look-and-feel-config/look-and-feel-config.module';
import { MapConfigModule } from '@map-config/map-config.module';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { SearchConfigModule } from '@search-config/search-config.module';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { StartupService } from '@services/startup/startup.service';
import { WalkthroughService } from '@services/walkthrough/walkthrough.service';
import { InputModalComponent } from '@shared-components/input-modal/input-modal.component';
import { SharedModule } from '@shared/shared.module';
import { TimelineConfigModule } from '@timeline-config/timeline-config.module';
import { OAuthModule } from 'angular-oauth2-oidc';
import {
  ArlasCollaborativesearchService, ArlasConfigurationDescriptor, ArlasConfigurationUpdaterService,
  ArlasIamService,
  ArlasStartupService, ArlasWalkthroughService, AuthentificationService, ConfigMenuModule, configUpdaterFactory,
  CONFIG_UPDATER, FETCH_OPTIONS, getOptionsFactory,
  iamServiceFactory, UserInfosComponent, PaginatorI18n,
  GET_OPTIONS, ArlasToolkitSharedModule, ArlasSettingsService
} from 'arlas-wui-toolkit';
import { environment } from 'environments/environment';
import { LoggerModule, TOKEN_LOGGER_CONFIG } from 'ngx-logger';
import { NgxSpinnerModule } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CollectionComponent } from './components/collection/collection.component';
import { StatusComponent } from './components/status/status.component';
import { AnalyticsConfigModule } from './modules/analytics-config/analytics-config.module';
import { ResultListConfigModule } from './modules/result-list-config/result-list-config.module';
import enComponents from 'arlas-web-components/assets/i18n/en.json';
import frComponents from 'arlas-web-components/assets/i18n/fr.json';
import enToolkit from 'arlas-wui-toolkit/assets/i18n/en.json';
import frToolkit from 'arlas-wui-toolkit/assets/i18n/fr.json';
import { GetCollectionDisplayModule } from 'arlas-web-components';


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

export class CustomTranslateLoader implements TranslateLoader {

  public constructor(private http: HttpClient) { }

  public getTranslation(lang: string): Observable<any> {
    const apiAddress = 'assets/i18n/' + lang + '.json?' + Date.now();
    return Observable.create(observer => {
      this.http.get(apiAddress).subscribe(
        res => {
          let merged = res;
          // Properties in res will overwrite those in fr.
          if (lang === 'fr') {
            merged = { ...frComponents, ...frToolkit, ...res };
          } else if (lang === 'en') {
            merged = { ...enComponents, ...enToolkit, ...res };
          }
          observer.next(merged);
          observer.complete();
        },
        error => {
          // failed to retrieve requested language file, use default
          observer.complete(); // => Default language is already loaded
        }
      );
    });
  }
}

@NgModule({
  declarations: [
    AppComponent,
    LeftMenuComponent,
    LandingPageComponent,
    LandingPageDialogComponent,
    StatusComponent,
    CollectionComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MapConfigModule,
    ResultListConfigModule,
    SearchConfigModule,
    LookAndFeelConfigModule,
    ConfigMenuModule,
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
    AnalyticsConfigModule,
    OAuthModule.forRoot(),
    ArlasToolkitSharedModule,
    GetCollectionDisplayModule
  ],
  providers: [
    forwardRef(() => ArlasConfigurationDescriptor),
    forwardRef(() => ArlasCollaborativesearchService),
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
      provide: 'ArlasIamService',
      useFactory: iamServiceFactory,
      deps: [ArlasIamService],
      multi: true
    },
    {
      provide: GET_OPTIONS,
      useFactory: getOptionsFactory,
      deps: [ArlasSettingsService, AuthentificationService, ArlasIamService]
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
      useValue: { duration: 3000, verticalPosition: 'bottom' }
    },
    {
      provide: MatPaginatorIntl,
      deps: [TranslateService],
      useFactory: (translateService: TranslateService) => new PaginatorI18n(translateService)
    }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

  bootstrap: [AppComponent],
  entryComponents: [LandingPageDialogComponent, InputModalComponent,
    UserInfosComponent]
})
export class AppModule { }
