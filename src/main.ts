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
import { enableProdMode, provideZoneChangeDetection, forwardRef, provideAppInitializer, inject, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { loadServiceFactory, startupServiceFactory, auhtentServiceFactory, CustomTranslateLoader } from './app/app.module';
import { environment } from './environments/environment';
import { ArlasConfigurationDescriptor, ArlasStartupService, AuthentificationService, iamServiceFactory, ArlasIamService, GET_OPTIONS, getOptionsFactory, ArlasSettingsService, ArlasWalkthroughService, ArlasConfigurationUpdaterService, FETCH_OPTIONS, CONFIG_UPDATER, configUpdaterFactory, PaginatorI18n, ConfigMenuModule, ArlasToolkitSharedModule } from 'arlas-wui-toolkit';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { StartupService } from '@services/startup/startup.service';
import { WalkthroughService } from '@services/walkthrough/walkthrough.service';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService, TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppRoutingModule } from './app/app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MapConfigModule } from '@map-config/map-config.module';
import { ResultListConfigModule } from './app/modules/result-list-config/result-list-config.module';
import { SearchConfigModule } from '@search-config/search-config.module';
import { LookAndFeelConfigModule } from '@look-and-feel-config/look-and-feel-config.module';
import { SharedModule } from '@shared/shared.module';
import { TimelineConfigModule } from '@timeline-config/timeline-config.module';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoggerModule } from 'ngx-logger';
import { environment as environment_1 } from 'environments/environment';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AnalyticsConfigModule } from './app/modules/analytics-config/analytics-config.module';
import { OAuthModule } from 'angular-oauth2-oidc';
import { GetCollectionDisplayNamePipe } from 'arlas-web-components';
import { AppComponent } from './app/app.component';

const load = () => defaultValuesService.load('default.json?' + Date.now());
const init = () => startupService.init();
const apiAddress = 'assets/i18n/' + lang + '.json?' + Date.now();
let merged = res;



if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, AppRoutingModule, BrowserAnimationsModule, MapConfigModule, ResultListConfigModule, SearchConfigModule, LookAndFeelConfigModule, ConfigMenuModule, SharedModule, TimelineConfigModule, TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useClass: CustomTranslateLoader,
                deps: [HttpClient]
            }
        }), LoggerModule.forRoot({
            level: environment.logLevel,
            disableConsoleLogging: false
        }), NgxSpinnerModule, AnalyticsConfigModule, OAuthModule.forRoot(), ArlasToolkitSharedModule, GetCollectionDisplayNamePipe),
        forwardRef(() => ArlasConfigurationDescriptor),
        forwardRef(() => ArlasStartupService),
        provideAppInitializer(() => {
            const initializerFn = (loadServiceFactory)(inject(DefaultValuesService));
            return initializerFn();
        }),
        provideAppInitializer(() => {
            const initializerFn = (startupServiceFactory)(inject(StartupService));
            return initializerFn();
        }),
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
        },
        provideAnimationsAsync()
    ]
})
  .catch(err => console.error(err));
