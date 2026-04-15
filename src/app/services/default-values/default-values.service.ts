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
import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { getObject } from '@utils/tools';
import Ajv from 'ajv';
import ajvKeywords from 'ajv-keywords';
import * as draftSchema from 'ajv/lib/refs/json-schema-draft-06.json';
import { NGXLogger } from 'ngx-logger';
import { mergeMap } from 'rxjs';
import * as defaultValuesSchema from './defaultValues.schema.json';

/**
 * Configuration of the slider of a PropertySelectorFormGroup
 */
export interface SliderDefaultConfig {
  min: number;
  max: number;
  step: number;
}

export interface DefaultConfig {
  aggregationTermSize: number;
  palettes: Array<Array<string>>;
  colorPickerPresets: Array<string>;
  otherColor: string;
  /**
   * Configuration of all the sliders of the builder's PropertySelectorFormGroup.
   * For each property, an entry is necessary in the default.json or an error will be thrown when loading a dashboard
   */
  sliders: Record<string, SliderDefaultConfig>;
  huePalettes: Array<[number, number] | string>;
  swimlaneZeroColor: string;
  swimlaneNanColor: string;
  swimlaneRepresentation: string;
}

@Injectable({
  providedIn: 'root'
})
export class DefaultValuesService {

  private config: any;

  public constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger
  ) { }

  public validateConfiguration(data) {
    return new Promise<any>((resolve, reject) => {
      const ajvObj = new Ajv();
      ajvKeywords(ajvObj, 'uniqueItemProperties');
      const validateConfig = ajvObj
        .addMetaSchema(draftSchema.default)
        .compile((defaultValuesSchema as any).default);
      if (validateConfig(data) === false) {
        const errorMessagesList = new Array<string>();
        errorMessagesList.push(
          validateConfig.errors[0].schemaPath + ' ' +
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
      .pipe(mergeMap((response) => {
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

  public getOptionalValue(keyPath: string) {
    return getObject(this.config, 'root.' + keyPath);
  }

  public getValue(keyPath: string) {
    return this.getOptionalValue(keyPath).value;
  }

  public getDefaultConfig(): DefaultConfig {
    return this.getValue('config') as DefaultConfig;
  }

  /**
   * Set the default values into the control and its sub-controls recursively
   */
  public setDefaultValueRecursively(path: string, control: AbstractControl) {

    if (control instanceof FormGroup || control instanceof FormArray) {
      Object.keys(control.controls).forEach(c => {
        this.setDefaultValueRecursively(path + '.' + c, control.controls[c]);
      });
    } else {
      const defaultValue = this.getOptionalValue(path);
      if (defaultValue.isPresent) {
        control.setValue(defaultValue.value);
      }
    }
  }
}
