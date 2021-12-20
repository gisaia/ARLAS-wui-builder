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
import { RouterModule, Routes } from '@angular/router';
import { ConfirmExitGuard } from '@guards/confirm-exit/confirm-exit.guard';
import { BasemapsComponent } from './components/basemaps/basemaps.component';
import { EditLayerComponent } from './components/edit-layer/edit-layer.component';
import { EditVisualisationComponent } from './components/edit-visualisation/edit-visualisation.component';
import { GlobalMapComponent } from './components/global-map/global-map.component';
import { LayersComponent } from './components/layers/layers.component';
import { PreviewComponent } from './components/preview/preview.component';
import { VisualisationsComponent } from './components/visualisations/visualisations.component';
import { MapConfigComponent } from './map-config.component';

const routes: Routes = [
  {
    path: '', component: MapConfigComponent, children: [
      { path: '', redirectTo: 'global', pathMatch: 'full' },
      { path: 'global', component: GlobalMapComponent },
      { path: 'preview', component: PreviewComponent },
      { path: 'basemaps', component: BasemapsComponent },
      {
        path: 'layers', children: [
          { path: '', component: LayersComponent, pathMatch: 'full' },
          { path: 'add', component: EditLayerComponent, canDeactivate: [ConfirmExitGuard] },
          { path: 'edit/:id', component: EditLayerComponent, canDeactivate: [ConfirmExitGuard] }
        ]
      },
      {
        path: 'visualisations', children: [
          { path: '', component: VisualisationsComponent, pathMatch: 'full' },
          { path: 'add', component: EditVisualisationComponent, canDeactivate: [ConfirmExitGuard] },
          { path: 'edit/:id', component: EditVisualisationComponent, canDeactivate: [ConfirmExitGuard] }
        ]
      }
    ]
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MapConfigRoutingModule {
}
