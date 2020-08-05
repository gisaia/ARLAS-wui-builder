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
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { EnvService } from '@services/env/env.service';
import { Configuration, DataResource, DataWithLinks, PersistApi } from 'arlas-persistence-api';
import { AuthentificationService } from 'arlas-wui-toolkit/services/authentification/authentification.service';
import * as portableFetch from 'portable-fetch';
import { Observable } from 'rxjs/internal/Observable';
import { from } from 'rxjs/internal/observable/from';
import { flatMap, map } from 'rxjs/operators';
import { GET_OPTIONS } from 'arlas-wui-toolkit/services/persistence/persistence.service';

// tslint:disable-next-line: ban-types
export const OBJECT_TYPE = 'config.json';

@Injectable({
  providedIn: 'root'
})
export class PersistenceService {

  private persistenceApi: PersistApi;
  public isAvailable = false;
  public isAuthenticate = false;
  public isAuthAvailable = false;

  constructor(
    private envService: EnvService,
    @Inject(GET_OPTIONS) private getOptions,
    private authentificationService: AuthentificationService
  ) {
    const configuration = new Configuration();
    this.isAuthAvailable = !!this.authentificationService.authConfig;
    if (this.isAuthAvailable) {
      this.authentificationService.isAuthenticated.subscribe(isAuth => {
        this.isAuthenticate = isAuth;
        if (this.envService.persistenceUrl !== '') {
          const baseUrl = this.envService.persistenceUrl;
          this.persistenceApi = new PersistApi(configuration, baseUrl, portableFetch);
          this.isAvailable = true;
        }
      });
    } else {
      if (this.envService.persistenceUrl !== '') {
        const baseUrl = this.envService.persistenceUrl;
        this.persistenceApi = new PersistApi(configuration, baseUrl, portableFetch);
        this.isAvailable = true;
      }
    }

  }


  public delete(id: string): Observable<DataWithLinks> {
    return from(this.persistenceApi.deleteById(id, false, this.getOptions()));
  }

  public create(value: string, name: string, readers?: string[], writers?: string[]): Observable<DataWithLinks> {
    return from(this.persistenceApi.create(OBJECT_TYPE, name, value, readers, writers, false, this.getOptions()));

  }
  public get(id: string): Observable<DataWithLinks> {
    return from(this.persistenceApi.getById(id, false, this.getOptions()));

  }
  public list(size: number, page: number, order: string): Observable<DataResource> {
    return from(this.persistenceApi.list(OBJECT_TYPE, size, page, order, false, this.getOptions()));

  }
  public update(
    id: string, value: string, lastUpdate: number, name?: string, readers?: string[], writers?: string[]
  ): Observable<DataWithLinks> {
    return from(this.persistenceApi.update(id, value, lastUpdate, name, readers, writers, false, this.getOptions()));
  }

  public duplicate(id: string, newName?: string): Observable<DataWithLinks> {
    return this.get(id).pipe(
      map(data =>  {
        return this.create(data.doc_value, newName ? newName : 'Copy of ' + data.doc_key);
      }),
      flatMap(a => a)
    );
  }

}
