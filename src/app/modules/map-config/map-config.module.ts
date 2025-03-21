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
import { NgModule } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmExitGuard } from '@guards/confirm-exit/confirm-exit.guard';
import { SharedModule } from '@shared/shared.module';
import {
  AbstractArlasMapService,
  ArlasMapFrameworkService,
  ArlasMapModule,
  BasemapService,
  LegendService
} from 'arlas-map';

import { GetCollectionDisplayModule } from 'arlas-web-components';
import { BasemapsComponent } from './components/basemaps/basemaps.component';
import { DialogColorTableComponent } from './components/dialog-color-table/dialog-color-table.component';
import { DialogFilterComponent } from './components/dialog-filter/dialog-filter.component';
import { DialogPaletteSelectorComponent } from './components/dialog-palette-selector/dialog-palette-selector.component';
import { EditLayerComponent } from './components/edit-layer/edit-layer.component';
import { EditVisualisationComponent } from './components/edit-visualisation/edit-visualisation.component';
import { GlobalMapComponent } from './components/global-map/global-map.component';
import { ImportLayerDialogComponent } from './components/import-layer-dialog/import-layer-dialog.component';
import { LayersComponent } from './components/layers/layers.component';
import { PreviewComponent } from './components/preview/preview.component';
import { VisualisationsComponent } from './components/visualisations/visualisations.component';
import { MapConfigRoutingModule } from './map-config-routing.module';
import { MapConfigComponent } from './map-config.component';
import { ArlasMaplibreService, ArlasMapService, MaplibreBasemapService, MaplibreLegendService } from 'arlas-maplibre';
import { PaletteGradientPipe } from '@shared/pipes/palette-gradien.pipe';

@NgModule({
  declarations: [
    MapConfigComponent,
    GlobalMapComponent,
    LayersComponent,
    EditLayerComponent,
    EditVisualisationComponent,
    DialogColorTableComponent,
    DialogFilterComponent,
    DialogPaletteSelectorComponent,
    PreviewComponent,
    VisualisationsComponent,
    BasemapsComponent,
    ImportLayerDialogComponent
  ],
  imports: [
    MapConfigRoutingModule,
    ArlasMapModule,
    SharedModule,
    GetCollectionDisplayModule,
    PaletteGradientPipe
  ],
  providers: [
    ConfirmExitGuard,
    { provide: MAT_DIALOG_DATA, useValue: {} },
    {
      provide: AbstractArlasMapService,
      useClass: ArlasMapService
    },
    ArlasMaplibreService,
    {
      provide: BasemapService,
      useClass: MaplibreBasemapService
    },
    {
      provide: LegendService,
      useClass: MaplibreLegendService
    },
    {
      provide: ArlasMapFrameworkService,
      useClass: ArlasMaplibreService
    },
    ArlasMapService,
  ]
})
export class MapConfigModule {}
