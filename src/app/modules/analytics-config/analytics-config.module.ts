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
import { EditTabComponent } from './components/edit-tab/edit-tab.component';
import { WidgetEditionComponent } from './components/widget-edition/widget-edition.component';
import { ShortcutsComponent } from './components/shortcuts/shortcuts.component';
import { EditResultlistQuicklookComponent } from './components/edit-resultlist-quicklook/edit-resultlist-quicklook.component';
import { EditHistogramLabelComponent } from './components/edit-histogram-label/edit-histogram-label.component';
import { MetricsTableDataComponent } from './components/metrics-table-data/metrics-table-data.component';
import { AddSubtableDialogComponent } from './components/add-subtable-dialog/add-subtable-dialog.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { GetCollectionDisplayModule, GetFieldDisplayModule } from 'arlas-web-components';

@NgModule({
  declarations: [
    TabsComponent,
    GroupsComponent,
    ShortcutsComponent,
    EditGroupComponent,
    WidgetEditionComponent,
    EditWidgetDialogComponent,
    AddWidgetDialogComponent,
    EditResultlistColumnsComponent,
    EditResultlistDetailsComponent,
    ResultlistDataComponent,
    ImportWidgetDialogComponent,
    EditTabComponent,
    EditResultlistQuicklookComponent,
    EditHistogramLabelComponent,
    MetricsTableDataComponent,
    AddSubtableDialogComponent
  ],
  imports: [
    ArlasToolkitSharedModule,
    SharedModule,
    AnalyticsConfigRoutingModule,
    IconPickerModule,
    MatExpansionModule,
    GetCollectionDisplayModule,
    GetFieldDisplayModule
  ]
})
export class AnalyticsConfigModule { }
