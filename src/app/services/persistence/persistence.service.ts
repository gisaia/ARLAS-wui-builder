import { Injectable, InjectionToken, Inject } from '@angular/core';
import * as portableFetch from 'portable-fetch';

import { Observable } from 'rxjs/internal/Observable';
import { from } from 'rxjs/internal/observable/from';
import { Configuration, PersistenceApi, Data, DataResource } from 'arlas-persistence-api';
import { ArlasConfigService } from 'arlas-wui-toolkit';
import { EnvService } from '@services/env/env.service';

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
    const configuraiton = new Configuration();
    const baseUrl = this.envService.persistenceUrl;
    this.persistenceApi = new PersistenceApi(configuraiton, baseUrl, portableFetch);
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
