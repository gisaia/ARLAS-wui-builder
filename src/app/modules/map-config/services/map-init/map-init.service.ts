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
import { MainFormService } from '@services/main-form/main-form.service';
import { MapGlobalFormBuilderService } from '../map-global-form-builder/map-global-form-builder.service';
import { FormArray, Validators } from '@angular/forms';
import { CollectionService } from '@services/collection-service/collection.service';
import { ConfigFormGroup, SelectFormControl, InputFormControl } from '@shared-models/config-form';
import { MapBasemapFormBuilderService } from '../map-basemap-form-builder/map-basemap-form-builder.service';

@Injectable({
  providedIn: 'root'
})
export class MapInitService {

  constructor(
    private mainFormService: MainFormService,
    private mapGlobalFormBuilder: MapGlobalFormBuilderService,
    private mapBasemapFormBuilder: MapBasemapFormBuilderService,
    private collectionService: CollectionService
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
    }
  }

  // init the collection fields, to be done by creating a new configuration only
  private initCollectionFields() {
    // init global -> request geometries, by collection
    this.mainFormService.getCollections().forEach(collection => {
      this.collectionService.getDescribe(collection).subscribe(params => {
        this.mainFormService.mapConfig.getGlobalFg().customControls.requestGeometries.push(
          this.mapGlobalFormBuilder.buildRequestGeometry(
            collection,
            params.params.geometry_path,
            params.params.id_path
          )
        );
      });
    });
  }

}
