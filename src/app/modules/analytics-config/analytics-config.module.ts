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
import { AnalyticsConfigRoutingModule } from './analytics-config-routing.module';
import { TabsComponent } from './components/tabs/tabs.component';
import { SharedModule } from '@shared/shared.module';
import { GroupsComponent } from './components/groups/groups.component';
import { EditGroupComponent, AddWidgetDialogComponent } from './components/edit-group/edit-group.component';
import { EditWidgetDialogComponent } from './components/edit-widget-dialog/edit-widget-dialog.component';
import { ArlasToolkitSharedModule } from 'arlas-wui-toolkit';
import { IconPickerModule } from '@gisaia-team/ngx-icon-picker';
import { EditResultlistColumnsComponent } from './components/edit-resultlist-columns/edit-resultlist-columns.component';
import { EditResultlistDetailsComponent } from './components/edit-resultlist-details/edit-resultlist-details.component';
import { ResultlistDataComponent } from './components/resultlist-data/resultlist-data.component';
import { ImportWidgetDialogComponent } from './components/import-widget-dialog/import-widget-dialog.component';

@NgModule({
  entryComponents: [
    EditWidgetDialogComponent,
    AddWidgetDialogComponent,
    ResultlistDataComponent,
    ImportWidgetDialogComponent
  ],
  declarations: [
    TabsComponent,
    GroupsComponent,
    EditGroupComponent,
    EditWidgetDialogComponent,
    AddWidgetDialogComponent,
    EditResultlistColumnsComponent,
    EditResultlistDetailsComponent,
    ResultlistDataComponent,
    ImportWidgetDialogComponent
  ],
  imports: [
    ArlasToolkitSharedModule,
    SharedModule,
    AnalyticsConfigRoutingModule,
    IconPickerModule
  ]
})
export class AnalyticsConfigModule { }
