import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MapConfigComponent } from './map-config.component';
import { GlobalComponent } from './components/global/global.component';
import { LayersComponent } from './components/layers/layers.component';
import { EditLayerComponent } from './components/edit-layer/edit-layer.component';


const routes: Routes = [
  {
    path: '', component: MapConfigComponent, children: [
      { path: '', redirectTo: 'global', pathMatch: 'full' },
      { path: 'global', component: GlobalComponent },
      { path: 'layers', component: LayersComponent },
      { path: 'add-layer', component: EditLayerComponent },
      { path: 'edit-layer/:id', component: EditLayerComponent }
    ]
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MapConfigRoutingModule { }
