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
import { Injectable } from '@angular/core';
import { FormArray } from '@angular/forms';
import { CollectionService } from '@services/collection-service/collection.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { Basemap } from '@services/startup/startup.service';
import { ArlasSettingsService } from 'arlas-wui-toolkit';
import { MapBasemapFormBuilderService } from '../map-basemap-form-builder/map-basemap-form-builder.service';
import { MapGlobalFormBuilderService } from '../map-global-form-builder/map-global-form-builder.service';

@Injectable({
  providedIn: 'root'
})
export class MapInitService {

  public constructor(
    private mainFormService: MainFormService,
    private mapGlobalFormBuilder: MapGlobalFormBuilderService,
    private mapBasemapFormBuilder: MapBasemapFormBuilderService,
    private collectionService: CollectionService,
    private settingsService: ArlasSettingsService
  ) { }

  public initModule(initCollectionFields: boolean) {
    this.mainFormService.mapConfig.initGlobalFg(
      this.mapGlobalFormBuilder.build()
    );

    this.mainFormService.mapConfig.initLayersFa(
      new FormArray([], [])
    );

    this.mainFormService.mapConfig.initVisualisationsFa(
      new FormArray([], [])
    );

    this.mainFormService.mapConfig.initBasemapsFg(
      this.mapBasemapFormBuilder.build()
    );

    if (initCollectionFields) {
      this.initCollectionFields();
      this.initBasemap();
    }
  }

  // init the collection fields, to be done by creating a new configuration only
  private initCollectionFields() {
    // init global -> request geometries, by collection
    const collection = this.mainFormService.getMainCollection();
    this.collectionService.getDescribe(collection).subscribe();
  }

  // init the basemap array, only when creating a new configuration
  private initBasemap() {
    let basemaps: Basemap[] = [];
    if (!!(this.settingsService.settings as any).basemaps && (this.settingsService.settings as any).basemaps.length > 0) {
      basemaps = (this.settingsService.settings as any).basemaps;
    } else {
      basemaps.push({
        name: 'Positron',
        url: 'https://api.maptiler.com/maps/positron/style.json?key=xIhbu1RwgdbxfZNmoXn4',
        image: 'https://api.maptiler.com/maps/8bb9093c-9865-452b-8be4-7a397f552b49/0/0/0.png?key=kO3nZIVLnPvIVn8AEnuk',
        checked: true,
        default: true,
        type: 'mapbox'
      });
    }
    const b = basemaps[0];
    this.mainFormService.mapConfig.getBasemapsFg().customControls.basemaps.push(
      this.mapBasemapFormBuilder.buildBasemapFormArray(b.name, b.url, b.image, b.type)
    );

  }

}
