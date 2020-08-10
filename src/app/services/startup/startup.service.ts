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
import { Injectable, Injector, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import ajv from 'ajv';
import * as ajvKeywords from 'ajv-keywords/keywords/uniqueItemProperties';
import * as draftSchema from 'ajv/lib/refs/json-schema-draft-06.json';
import { Configuration } from 'arlas-api';
import { ArlasCollaborativesearchService, ArlasConfigService, ArlasExploreApi,
  ArlasStartupService, ArlasSettings } from 'arlas-wui-toolkit';
import * as portableFetch from 'portable-fetch';
import { flatMap } from 'rxjs/operators';
import * as arlasConfSchema from './builderconfig.schema.json';

export const ZONE_WUI_BUILDER = 'config.json';

@Injectable({
  providedIn: 'root'
})
export class StartupService {

  public contributorRegistry: Map<string, any> = new Map<string, any>();

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

  constructor(
    private configService: ArlasConfigService,
    private arlasCss: ArlasCollaborativesearchService,
    private arlasStartupService: ArlasStartupService,
    private injector: Injector,
    private http: HttpClient,
    private translateService: TranslateService) {}

  
  public init(): Promise<string> {
    return this.arlasStartupService.applyAppSettings()
        .then((s: ArlasSettings) => this.arlasStartupService.authenticate(s))
        .then((s: ArlasSettings) => this.arlasStartupService.enrichHeaders(s))
        .then((s: ArlasSettings) => {
          return new Promise((resolve, reject) => {
            this.configService.setConfig({});
            resolve('Successfullly initialized app');
          });
        })
      // Init app with the language read from url
      .then(() => StartupService.translationLoaded(this.translateService, this.injector));
  }

  // This funcion could be used to valid an existing loaded conf
  public validLoadedConfig(configFilePath: string): Promise<boolean> {
    let configData;
    const ret = this.http
      .get(configFilePath)
      .pipe(flatMap((response) => {
        configData = response;
        return Promise.resolve(null);
      })).toPromise()
      .then(() => this.validateConfiguration(configData))
      .then((data) => this.setConfigService(data))
      .then((data) => this.setAuthentService(data))
      .then((data) => this.setCollaborativeService(data))
      .catch((err: any) => {
        console.error(err);
        return Promise.resolve(null);
      });
    return ret.then((x) => true);
  }

  public validateConfiguration(data) {
    return new Promise<any>((resolve, reject) => {
      const ajvObj = ajv();
      ajvKeywords(ajvObj);
      const validateConfig = ajvObj
        .addMetaSchema(draftSchema.default)
        .compile((arlasConfSchema as any).default);
      if (validateConfig(data) === false) {
        const errorMessagesList = new Array<string>();
        errorMessagesList.push(
          validateConfig.errors[0].dataPath + ' ' +
          validateConfig.errors[0].message
        );
        reject(new Error(errorMessagesList.join(' ')));
      } else {
        resolve(data);
      }
    });
  }


  public setConfigService(data) {
    return new Promise<any>((resolve, reject) => {
      this.configService.setConfig(data);
      resolve(this.configService.getConfig());
    });
  }

  public setCollaborativeService(data) {
    return new Promise<any>((resolve, reject) => {
      this.arlasCss.setConfigService(this.configService);
      const configuraiton: Configuration = new Configuration();
      const arlasExploreApi: ArlasExploreApi = new ArlasExploreApi(
        configuraiton,
        this.configService.getValue('arlas.server.url'),
        portableFetch
      );
      this.arlasCss.setExploreApi(arlasExploreApi);
      resolve(data);
    });
  }

  public setCollection(collection: string) {
    this.arlasCss.collection = collection;
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

  public setAuthentService(data) {
    console.log('fuckk')
    return new Promise<any>((resolve, reject) => {  
      if (this.configService.getValue('arlas.authentification')) {
        const useAuthentForArlas = this.configService.getValue('arlas.authentification.useAuthentForArlas');
        const useDiscovery = this.configService.getValue('arlas.authentification.useDiscovery');
        const authService = this.injector.get('AuthentificationService')[0];
        authService.initAuthService(this.configService, useDiscovery, useAuthentForArlas).then(() => {
          resolve([data, useAuthentForArlas]);
        });
      } else {
        resolve(data);
      }
    });
  }
}
