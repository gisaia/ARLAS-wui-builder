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
import { CommonModule } from '@angular/common';
import { TimelineConfigRoutingModule } from './timeline-config-routing.module';
import { TimelineConfigComponent } from './timeline-config.component';
import { GlobalTimelineComponent } from './components/global-timeline/global-timeline.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TimelineFormComponent } from './components/timeline-form/timeline-form.component';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [
    TimelineConfigComponent,
    GlobalTimelineComponent,
    TimelineFormComponent
  ],
  imports: [
    CommonModule,
    TimelineConfigRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MatFormFieldModule,
    MatSelectModule,
    TranslateModule,
    MatInputModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatTabsModule
  ]
})
export class TimelineConfigModule { }
