import { Injectable } from '@angular/core';
import { MapConfig } from '@services/main-form-manager/models-map-config';
import { Config } from '@services/main-form-manager/models-config';

@Injectable({
  providedIn: 'root'
})
export class MapImportService {

  constructor() { }
  public doImport(config: Config, mapConfig: MapConfig) {
  }

}
