import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MapConfigComponent } from './map-config.component';


const routes: Routes = [{
  path: '', component: MapConfigComponent, pathMatch: 'full'
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MapConfigRoutingModule { }
