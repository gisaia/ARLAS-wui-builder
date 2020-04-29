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

// tslint:disable-next-line: ban-types
export const GET_OPTIONS = new InjectionToken<(Function)>('get_options');

@Injectable({
  providedIn: 'root'
})
export class PersistenceService {

  private persistenceApi: PersistenceApi;
  constructor(
    private envService: EnvService,
    @Inject(GET_OPTIONS) private getOptions
  ) {
    const configuration = new Configuration();
    if (this.envService.persistenceUrl !== '') {
      const baseUrl = this.envService.persistenceUrl;
      this.persistenceApi = new PersistenceApi(configuration, baseUrl, portableFetch);
    }
  }


  public delete(id: string): Observable<Data> {
    return from(this.persistenceApi._delete(id, false, this.getOptions()));
  }

  public create(type: string, value: string): Observable<Data> {
    return from(this.persistenceApi.create(type, value, false, this.getOptions()));

  }
  public get(id: string): Observable<Data> {
    return from(this.persistenceApi.get(id, false, this.getOptions()));

  }
  public list(type: string, size: number, page: number, order: string): Observable<DataResource> {
    return from(this.persistenceApi.list(type, size, page, order, false, this.getOptions()));

  }
  public update(id: string, value: string): Observable<Data> {
    return from(this.persistenceApi.update(id, value, false, this.getOptions()));
  }

}
