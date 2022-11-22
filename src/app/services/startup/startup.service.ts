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
import { LOCATION_INITIALIZED } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Configuration } from 'arlas-api';
import {
  ArlasCollaborativesearchService, ArlasConfigService, ArlasExploreApi,
  ArlasStartupService, ArlasSettings, AuthentificationService
} from 'arlas-wui-toolkit';
import fetchIntercept from 'fetch-intercept';
import { map, Observable } from 'rxjs';

export const ZONE_WUI_BUILDER = 'config.json';
export const ZONE_PREVIEW = 'preview';

@Injectable({
  providedIn: 'root'
})
export class StartupService {

  public contributorRegistry: Map<string, any> = new Map<string, any>();
  public interceptorRegistry: Map<string, any> = new Map<string, any>();

  public static translationLoaded(translateService: TranslateService, injector) {
    return new Promise<any>((resolve: any) => {
      const url = window.location.href;
      const paramLangage = 'lg';
      // Set default language to current browser language
      let langToSet = navigator.language.slice(0, 2);
      const regex = new RegExp('[?&]' + paramLangage + '(=([^&#]*)|&|#|$)');
      const results = regex.exec(url);
      if (results && results[2]) {
        langToSet = decodeURIComponent(results[2].replace(/\+/g, ' '));
      }
      const locationInitialized = injector.get(LOCATION_INITIALIZED, Promise.resolve(null));
      locationInitialized.then(() => {
        translateService.setDefaultLang('en');
        translateService.use(langToSet).subscribe(() => {
          console.log(`Successfully initialized '${langToSet}' language.`);
        }, err => {
          console.error(`Problem with '${langToSet}' language initialization.'`);
        }, () => {
          resolve(`Successfully initialized '${langToSet}' language.`);
        });
      });
    });
  }

  public constructor(
    private configService: ArlasConfigService,
    private arlasCss: ArlasCollaborativesearchService,
    private arlasStartupService: ArlasStartupService,
    private injector: Injector,
    private http: HttpClient,
    private translateService: TranslateService) { }

  public init(): Promise<string> {
    return this.arlasStartupService.applyAppSettings()
      .then((s: ArlasSettings) => this.arlasStartupService.authenticate(s))
      .then((s: ArlasSettings) => this.arlasStartupService.enrichHeaders(s))
      .then((s: ArlasSettings) => new Promise((resolve, reject) => {
        this.configService.setConfig({});
        resolve('Successfullly initialized app');
      }))
      // Init app with the language read from url
      .then(() => StartupService.translationLoaded(this.translateService, this.injector));
  }

  public setCollaborativeService(data) {
    return new Promise<any>((resolve, reject) => {
      this.arlasCss.setConfigService(this.configService);
      const configuraiton: Configuration = new Configuration();
      const arlasExploreApi: ArlasExploreApi = new ArlasExploreApi(
        configuraiton,
        this.configService.getValue('arlas.server.url'),
        window.fetch
      );
      this.arlasCss.setExploreApi(arlasExploreApi);
      resolve(data);
    });
  }

  public setDefaultCollection(collection: string) {
    this.arlasCss.defaultCollection = collection;
  }

  public getConfigWithInitContrib(): any {
    // Add contributor part in arlasConfigService
    const currentConfig = this.configService.getConfig() as any;
    // Add web contributors in config if not exist
    if (currentConfig.arlas.web === undefined) {
      currentConfig.arlas.web = {};
      currentConfig.arlas.web.contributors = [];
    } else if (currentConfig.arlas.web.contributors === undefined) {
      currentConfig.arlas.web.contributors = [];
    }
    return currentConfig;
  }


  public applyArlasInterceptor(collection, filter) {
    const unregister = fetchIntercept.register({
      request: (url, config) => {
        if (typeof url === 'string' || (url as any) instanceof String){
          if (url.indexOf('/explore/' + collection +'/') >= 0) {
            // tslint:disable-next-line:no-string-literal
            config['headers']['partition-filter'] = JSON.stringify(filter);
          }
        }
        return [url, config];
      },
      requestError: (error) => Promise.reject(error),
      response: (response) => response,
      responseError: (error) =>
        // Handle an fetch error
        Promise.reject(error)
    });
    this.interceptorRegistry.set(collection, unregister);
  }

  public removeArlasInterceptor(collection) {
    this.interceptorRegistry.get(collection)();
    this.interceptorRegistry.delete(collection);
  }

  public getTimeFilter(collection, serverUrl, collectionService, arlasSettingsService): Observable<any> {
    return collectionService.getDescribe(collection).pipe(map(c => {
      const timeStampField = (c as any).params.timestamp_path;
      const url = serverUrl + '/explore/' + collection + '/_compute?field=' + timeStampField + '&metric=MAX';
      const request = new XMLHttpRequest();
      request.open('GET', url, false);  // `false`
      // tslint:disable-next-line:no-string-literal
      const authent = arlasSettingsService.settings['authentication'];
      if (!!authent && authent.use_authent) {
        const authService: AuthentificationService = this.injector.get('AuthentificationService')[0];
        request.setRequestHeader('Authorization', 'bearer ' + authService.accessToken);
      }
      request.send();
      let response;
      if (request.status === 200) {
        response = request.response;
      } else {
        throw new Error('request failed');
      }
      // tslint:disable-next-line:no-string-literal
      const maxValue = +JSON.parse(response)['value'];
      const minValue = maxValue - (7 * 24 * 60 * 60 * 1000);
      // tslint:disable-next-line:no-string-literal
      const timeFilter = {
        f: [
          [
            {
              field: timeStampField,
              op: 'range',
              value: '[' + minValue + '<' + maxValue + ']'
            }
          ]
        ]
      };
      return timeFilter;
    }));
  };

}
