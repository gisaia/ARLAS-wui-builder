import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SearchConfigRoutingModule } from './search-config-routing.module';
import { SearchConfigComponent } from './search-config.component';


@NgModule({
  declarations: [SearchConfigComponent],
  imports: [
    CommonModule,
    SearchConfigRoutingModule
  ]
})
export class SearchConfigModule { }
