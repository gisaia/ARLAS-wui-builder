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
import { MapConfig } from '@services/main-form-manager/models-map-config';
import { Config } from '@services/main-form-manager/models-config';
import { MapInitService } from '../map-init/map-init.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { importElements } from '@services/main-form-manager/tools';

@Injectable({
  providedIn: 'root'
})
export class MapImportService {

  constructor(
    private mapInitService: MapInitService,
    private mainFormService: MainFormService
  ) { }
  public doImport(config: Config, mapConfig: MapConfig) {
    this.mapInitService.initModule();
    this.importMapGlobal(config);
  }

  private importMapGlobal(config: Config) {
    const mapgl = config.arlas.web.components.mapgl;
    const mapContrib = config.arlas.web.contributors.find(c => c.identifier === 'mapbox');
    const mapGlobalForm = this.mainFormService.mapConfig.getGlobalFg();

    mapGlobalForm.customControls.requestGeometries.push(
      this.mapInitService.createRequestGeometry(
        config.arlas.server.collection.name,
        mapContrib.geoQueryField,
        mapgl.input.idFeatureField
      )
    );

    importElements([
      {
        value: mapContrib.geoQueryOp,
        control: mapGlobalForm.customControls.geographicalOperator
      },
      {
        value: mapgl.allowMapExtend,
        control: mapGlobalForm.customControls.allowMapExtend
      },
      {
        value: mapgl.input.margePanForLoad,
        control: mapGlobalForm.customControls.margePanForLoad
      },
      {
        value: mapgl.input.margePanForTest,
        control: mapGlobalForm.customControls.margePanForTest
      },
      {
        value: mapgl.input.initZoom,
        control: mapGlobalForm.customControls.initZoom
      },
      {
        value: mapgl.input.initCenter[0],
        control: mapGlobalForm.customControls.initCenterLat
      },
      {
        value: mapgl.input.initCenter[1],
        control: mapGlobalForm.customControls.initCenterLon
      },
      {
        value: mapgl.input.displayScale,
        control: mapGlobalForm.customControls.displayScale
      }
    ]);

  }

}
