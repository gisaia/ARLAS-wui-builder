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
import { TranslateLoader } from '@ngx-translate/core';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { StartupService } from '@services/startup/startup.service';
import enComponents from 'arlas-web-components/assets/i18n/en.json';
import frComponents from 'arlas-web-components/assets/i18n/fr.json';
import {
  AuthentificationService
} from 'arlas-wui-toolkit';
import enToolkit from 'arlas-wui-toolkit/assets/i18n/en.json';
import frToolkit from 'arlas-wui-toolkit/assets/i18n/fr.json';
import { Observable } from 'rxjs';


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

  public constructor(private readonly http: HttpClient) { }

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


