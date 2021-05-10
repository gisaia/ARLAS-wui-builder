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
import { Component, OnInit } from '@angular/core';
import { PersistenceService } from 'arlas-wui-toolkit/services/persistence/persistence.service';
import { ZONE_WUI_BUILDER } from '@services/startup/startup.service';
import { DataResource, DataWithLinks } from 'arlas-persistence-api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material';
import { Config } from '@services/main-form-manager/models-config';
import { Layer, MapConfig, HOVER_LAYER_PREFIX, SELECT_LAYER_PREFIX } from '@services/main-form-manager/models-map-config';
import { MainFormService } from '@services/main-form/main-form.service';
import { CollectionService } from '@services/collection-service/collection.service';

@Component({
  selector: 'app-import-layer-dialog',
  templateUrl: './import-layer-dialog.component.html',
  styleUrls: ['./import-layer-dialog.component.scss']
})
export class ImportLayerDialogComponent implements OnInit {

  public configs: DataWithLinks[];
  public layers: Layer[];
  public dashboardConfigJson: Config;
  public importLayerFormGroup: FormGroup;

  constructor(
    private persistenceService: PersistenceService,
    private collectionService: CollectionService
  ) { }

  public ngOnInit() {
    this.importLayerFormGroup = new FormGroup(
      {
        dashboard: new FormControl(null, Validators.required),
        layer: new FormControl(null, Validators.required)
      }
    );

    if (this.persistenceService.isAvailable) {
      this.persistenceService.list(ZONE_WUI_BUILDER, null, null, 'desc').subscribe({
        next: (data: DataResource) => {
          this.configs = data.data.filter(
            dash => {
              if (!!dash.doc_value) {
                const config = JSON.parse(dash.doc_value) as Config;
                return (!!config && !!config.arlas && !!config.arlas.server && !!config.arlas.server.collection);
              } else {
                return false;
              }
            }
          );
        }
      });
    }
  }

  public getLayers(event: MatSelectChange) {
    this.dashboardConfigJson = JSON.parse(event.value.doc_value) as Config;
    const importableLayers = new Set<string>();
    const availableCollections = new Set(this.collectionService.getCollections());
    this.dashboardConfigJson.arlas.web.contributors.forEach(cont => {
      if (!cont.collection) {
        cont.collection = this.dashboardConfigJson.arlas.server.collection.name;
      }
    });
    this.dashboardConfigJson.arlas.web.contributors.filter(c => c.type === 'map' && availableCollections.has(c.collection))
      .forEach(cont => {
        cont.layers_sources.forEach(ls => importableLayers.add(ls.id));
      });
    let configLayers = (this.dashboardConfigJson.arlas.web.components.mapgl.input.mapLayers as MapConfig).layers;
    if (!!configLayers) {
      configLayers = configLayers.filter(l => !!l && !l.id.startsWith(HOVER_LAYER_PREFIX) && !l.id.startsWith(SELECT_LAYER_PREFIX)
        && importableLayers.has(l.id));
    }
    this.layers = configLayers;
  }

}
