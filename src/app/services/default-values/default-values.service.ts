import { Injectable } from '@angular/core';
import { flatMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import * as ajv from 'ajv';
import * as ajvKeywords from 'ajv-keywords/keywords/uniqueItemProperties';
import * as draftSchema from 'ajv/lib/refs/json-schema-draft-06.json';
import * as defaultValuesSchema from './defaultValues.schema.json';
import { getObject } from '@app/utils/tools';


@Injectable({
  providedIn: 'root'
})
export class DefaultValuesService {

  private config: any;

  constructor(private http: HttpClient) { }

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
        console.error(err);
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
}
