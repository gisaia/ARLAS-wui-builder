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
import ajv from 'ajv';
import * as ajvKeywords from 'ajv-keywords/keywords/uniqueItemProperties';
import * as draftSchema from 'ajv/lib/refs/json-schema-draft-06.json';
import { Configuration } from 'arlas-api';
import { ArlasCollaborativesearchService, ArlasConfigService, ArlasExploreApi } from 'arlas-wui-toolkit';
import * as portableFetch from 'portable-fetch';
import { flatMap } from 'rxjs/operators';
import * as arlasConfSchema from './builderconfig.schema.json';

@Injectable({
  providedIn: 'root'
})
export class StartupService {

  constructor(
    private http: HttpClient,
    private configService: ArlasConfigService,
    private arlasCss: ArlasCollaborativesearchService,
    private translateService: TranslateService,
    private injector: Injector
  ) { }

  public init(): Promise<string> {
    // Init app with an empty configuration
    return this.setConfigService({})
      // Init app with the language read from url
      .then(() => this.translationLoaded());
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

  public translationLoaded() {
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
      const locationInitialized = this.injector.get(LOCATION_INITIALIZED, Promise.resolve(null));
      locationInitialized.then(() => {
        this.translateService.setDefaultLang('en');
        this.translateService.use(langToSet).subscribe(() => {
          console.log(`Successfully initialized '${langToSet}' language.`);
        }, err => {
          console.error(`Problem with '${langToSet}' language initialization.'`);
        }, () => {
          resolve(`Successfully initialized '${langToSet}' language.`);
        });
      });
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
}
