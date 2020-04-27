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
import { NgModule } from '@angular/core';
import { ConfirmExitGuard } from '@guards/confirm-exit/confirm-exit.guard';
import { ConfirmModalComponent } from '@shared/components/confirm-modal/confirm-modal.component';
import { SharedModule } from '@shared/shared.module';
import { DialogColorTableComponent } from './components/dialog-color-table/dialog-color-table.component';
import { DialogPaletteSelectorComponent } from './components/dialog-palette-selector/dialog-palette-selector.component';
import { EditLayerClusterComponent } from './components/edit-layer-cluster/edit-layer-cluster.component';
import { EditLayerFeatureMetricComponent } from './components/edit-layer-feature-metric/edit-layer-feature-metric.component';
import { EditLayerFeaturesComponent } from './components/edit-layer-features/edit-layer-features.component';
import { EditLayerModeFormComponent } from './components/edit-layer-mode-form/edit-layer-mode-form.component';
import { EditLayerComponent } from './components/edit-layer/edit-layer.component';
import { GlobalMapComponent } from './components/global-map/global-map.component';
import { LayersComponent } from './components/layers/layers.component';
import { MapConfigRoutingModule } from './map-config-routing.module';
import { MapConfigComponent } from './map-config.component';
import { PreviewModalComponent } from './components/preview-modal/preview-modal.component';
import { MapglComponent, MapglModule } from 'arlas-web-components';

@NgModule({
  entryComponents: [
    ConfirmModalComponent,
    DialogColorTableComponent,
    DialogPaletteSelectorComponent,
    MapglComponent,
    PreviewModalComponent
  ],
  declarations: [
    MapConfigComponent,
    GlobalMapComponent,
    LayersComponent,
    EditLayerComponent,
    EditLayerModeFormComponent,
    DialogColorTableComponent,
    DialogPaletteSelectorComponent,
    EditLayerFeatureMetricComponent,
    EditLayerFeaturesComponent,
    EditLayerClusterComponent,
    PreviewModalComponent
  ],
  imports: [
    MapConfigRoutingModule,
    MapglModule,
    SharedModule
  ],
  providers: [
    ConfirmExitGuard
  ]
})
export class MapConfigModule { }
