import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapConfigRoutingModule } from './map-config-routing.module';
import { MapConfigComponent } from './map-config.component';

@NgModule({
  declarations: [MapConfigComponent],
  imports: [
    CommonModule,
    MapConfigRoutingModule
  ]
})
export class MapConfigModule { }
