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
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { CollectionService } from '@services/collection-service/collection.service';
import { AnalyticComponentConfig, AnalyticConfig, Config, ContributorConfig } from '@services/main-form-manager/models-config';
import { MainFormService } from '@services/main-form/main-form.service';
import { ZONE_WUI_BUILDER } from '@services/startup/startup.service';
import { DataResource, DataWithLinks } from 'arlas-persistence-api';
import { PersistenceService } from 'arlas-wui-toolkit';

@Component({
  selector: 'arlas-import-widget-dialog',
  templateUrl: './import-widget-dialog.component.html',
  styleUrls: ['./import-widget-dialog.component.scss']
})
export class ImportWidgetDialogComponent implements OnInit {

  public configs: DataWithLinks[];
  public dashboardConfigJson: Config;
  public importWidgetFormGroup: FormGroup;
  public analytics = new Map<string, Array<AnalyticConfig>>();
  public contributors = new Map<string, string>();

  public selectedWidgets: Array<AnalyticComponentConfig> = new Array();
  public selectedWidgetsSet: Set<AnalyticComponentConfig> = new Set();

  public constructor(
    private persistenceService: PersistenceService,
    private collectionService: CollectionService,
    private mainformService: MainFormService,
    private cdr: ChangeDetectorRef
  ) { }

  public ngOnInit() {
    this.importWidgetFormGroup = new FormGroup(
      {
        dashboard: new FormControl(null, Validators.required),
        componentConfig: new FormControl(null, Validators.required)

      }
    );

    if (this.persistenceService.isAvailable) {
      this.persistenceService.list(ZONE_WUI_BUILDER, null, null, 'desc').subscribe({
        next: (data: DataResource) => {
          this.configs = data.data.filter(
            dash => {
              if (!!dash.doc_value) {
                const config = JSON.parse(dash.doc_value) as Config;
                return (!!config && !!config.arlas && !!config.arlas.server && !!config.arlas.server.collection);
              } else {
                return false;
              }
            }
          );
        }
      });
    }
  }

  public onChange(event) {
    if (event.checked) {
      this.selectedWidgetsSet.add(event.source.value);
    } else {
      this.selectedWidgetsSet.delete(event.source.value);
    }
    this.selectedWidgets = Array.from(this.selectedWidgetsSet);
    this.cdr.detectChanges();
  }

  public getWidgets(event: MatSelectChange) {
    this.dashboardConfigJson = JSON.parse(event.value.doc_value) as Config;
    const importableWidgets = new Set<string>();
    const availableCollections = new Set(this.collectionService.getCollections());
    this.dashboardConfigJson.arlas.web.contributors.forEach(cont => {
      if (!cont.collection) {
        cont.collection = this.dashboardConfigJson.arlas.server.collection.name;
      }
    });
    this.dashboardConfigJson.arlas.web.contributors.filter(c => availableCollections.has(c.collection))
      .forEach(cont => {
        importableWidgets.add(cont.identifier);
      });


    this.analytics = new Map<string, Array<AnalyticConfig>>();
    this.dashboardConfigJson = JSON.parse(event.value.doc_value) as Config;
    const analytics: Array<AnalyticConfig> = this.dashboardConfigJson.arlas.web.analytics;
    const contributors: Array<ContributorConfig> = this.dashboardConfigJson.arlas.web.contributors;
    analytics.forEach(a => {
      let tabAnalytics = this.analytics.get(a.tab);
      if (!tabAnalytics) {
        tabAnalytics = new Array();
      }
      a.components = a.components.filter(c => importableWidgets.has(c.contributorId));
      a.components.forEach(c => this.contributors.set(c.contributorId,
        contributors.find(cont => cont.identifier === c.contributorId).name));
      tabAnalytics.push(a);
      this.analytics.set(a.tab, tabAnalytics);
    });
    this.cdr.detectChanges();

  }

}
