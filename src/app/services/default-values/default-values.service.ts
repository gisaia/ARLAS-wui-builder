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
import { Injectable } from '@angular/core';
import { flatMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import * as ajv from 'ajv';
import * as ajvKeywords from 'ajv-keywords/keywords/uniqueItemProperties';
import * as draftSchema from 'ajv/lib/refs/json-schema-draft-06.json';
import * as defaultValuesSchema from './defaultValues.schema.json';
import { getObject } from '@utils/tools';
import { NGXLogger } from 'ngx-logger';

export interface DefaultConfig {
  aggregationTermSize: number;
  palettes: Array<Array<string>>;
  colorPickerPresets: Array<string>;
  otherColor: string;
}
@Injectable({
  providedIn: 'root'
})
export class DefaultValuesService {

  private config: any;

  constructor(
    private http: HttpClient,
    private logger: NGXLogger
  ) { }

  public validateConfiguration(data) {
    return new Promise<any>((resolve, reject) => {
      const ajvObj = ajv();
      ajvKeywords(ajvObj);
      const validateConfig = ajvObj
        .addMetaSchema(draftSchema.default)
        .compile((defaultValuesSchema as any).default);
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

  public load(configRessource: string): Promise<any> {
    let configData;
    const ret = this.http
      .get(configRessource)
      .pipe(flatMap((response) => {
        configData = response;
        return Promise.resolve(null);
      })).toPromise()
      .then(() => this.validateConfiguration(configData))
      .then((data) => this.setConfig(data))
      .catch((err: any) => {
        this.logger.error(err);
        return Promise.resolve(null);
      });
    return ret.then((x) => { });
  }

  public setConfig(config) {
    this.config = config;
  }

  public getValue(keyPath: string) {
    return getObject(this.config, 'root.' + keyPath);
  }

  public getDefaultConfig(): DefaultConfig {
    return this.getValue('config') as DefaultConfig;
  }
}
