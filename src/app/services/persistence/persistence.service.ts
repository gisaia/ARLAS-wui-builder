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
import { Injectable, InjectionToken, Inject } from '@angular/core';
import * as portableFetch from 'portable-fetch';

import { Observable } from 'rxjs/internal/Observable';
import { from } from 'rxjs/internal/observable/from';
import { Configuration, PersistenceApi, Data, DataResource } from 'arlas-persistence-api';
import { EnvService } from '@services/env/env.service';
import { map, mergeMap, flatMap } from 'rxjs/operators';
import { ConfigPersistence } from '@services/main-form-manager/models-config';

// tslint:disable-next-line: ban-types
export const GET_OPTIONS = new InjectionToken<(Function)>('get_options');
export const OBJECT_TYPE = 'config.json';

@Injectable({
  providedIn: 'root'
})
export class PersistenceService {

  private persistenceApi: PersistenceApi;
  public isAvailable = false;

  constructor(
    private envService: EnvService,
    @Inject(GET_OPTIONS) private getOptions
  ) {
    const configuration = new Configuration();
    if (this.envService.persistenceUrl !== '') {
      const baseUrl = this.envService.persistenceUrl;
      this.persistenceApi = new PersistenceApi(configuration, baseUrl, portableFetch);
      this.isAvailable = true;
    }
  }


  public delete(id: string): Observable<Data> {
    return from(this.persistenceApi._delete(id, false, this.getOptions()));
  }

  public create(value: string): Observable<Data> {
    return from(this.persistenceApi.create(OBJECT_TYPE, value, false, this.getOptions()));

  }
  public get(id: string): Observable<Data> {
    return from(this.persistenceApi.get(id, false, this.getOptions()));

  }
  public list(size: number, page: number, order: string): Observable<DataResource> {
    return from(this.persistenceApi.list(OBJECT_TYPE, size, page, order, false, this.getOptions()));

  }
  public update(id: string, value: string): Observable<Data> {
    return from(this.persistenceApi.update(id, value, false, this.getOptions()));
  }

  public duplicate(id: string, newName?: string): Observable<Data> {
    return this.get(id).pipe(
      map(data => data.doc_value),
      map(docValue => {
        const duplicateConfig = JSON.parse(docValue) as ConfigPersistence;
        if (newName !== '') {
          duplicateConfig.name = newName;
        } else {
          duplicateConfig.name = 'Copy of ' + duplicateConfig.name;
        }
        return this.create(JSON.stringify(duplicateConfig));
      }),
      flatMap(a => a)
    );
  }

}
