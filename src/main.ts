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
import { enableProdMode, forwardRef, importProvidersFrom, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { StartupService } from '@services/startup/startup.service';
import { WalkthroughService } from '@services/walkthrough/walkthrough.service';
import { OAuthModule } from 'angular-oauth2-oidc';
import {
    ArlasConfigurationDescriptor, ArlasConfigurationUpdaterService, ArlasIamService, ArlasSettingsService,
    ArlasStartupService, ArlasToolkitSharedModule, ArlasWalkthroughService, AuthentificationService, CONFIG_UPDATER,
    configUpdaterFactory, FETCH_OPTIONS, GET_OPTIONS, getOptionsFactory, iamServiceFactory, PaginatorI18n
} from 'arlas-wui-toolkit';
import { LoggerModule } from 'ngx-logger';
import { AppRoutingModule } from './app/app-routing.module';
import { AppComponent } from './app/app.component';
import { auhtentServiceFactory, CustomTranslateLoader, loadServiceFactory, startupServiceFactory } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(
            AppRoutingModule,
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
            OAuthModule.forRoot(),
            ArlasToolkitSharedModule
        ),
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
        {
            provide: FETCH_OPTIONS,
            useValue: {}
        },
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
        provideAnimationsAsync(),
        provideZoneChangeDetection()
    ]
})
  .catch(err => console.error(err));
