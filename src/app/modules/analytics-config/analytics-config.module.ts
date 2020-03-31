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
import { AnalyticsConfigRoutingModule } from './analytics-config-routing.module';
import { AnalyticsConfigComponent } from './analytics-config.component';
import { LayoutTabsComponent } from './components/layout-tabs/layout-tabs.component';
import { MatTabsModule } from '@angular/material/tabs';
import { SharedModule } from '@shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LayoutGroupsComponent } from './components/layout-groups/layout-groups.component';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    AnalyticsConfigComponent,
    LayoutTabsComponent,
    LayoutGroupsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AnalyticsConfigRoutingModule,
    MatTabsModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    TranslateModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    DragDropModule,
    MatListModule,
    MatSelectModule,
    MatTooltipModule
  ]
})
export class AnalyticsConfigModule { }
