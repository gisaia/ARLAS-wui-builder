import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimelineConfigRoutingModule } from './timeline-config-routing.module';
import { TimelineConfigComponent } from './timeline-config.component';


@NgModule({
  declarations: [TimelineConfigComponent],
  imports: [
    CommonModule,
    TimelineConfigRoutingModule
  ]
})
export class TimelineConfigModule { }
