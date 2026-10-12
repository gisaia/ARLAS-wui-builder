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
import { Injectable } from '@angular/core';
import { marker } from '@colsen1991/ngx-translate-extract-marker';
import { MainFormService } from '@services/main-form/main-form.service';
import { Page } from '@utils/tools';
import { ArlasSettingsService } from 'arlas-wui-toolkit';

@Injectable({
  providedIn: 'root'
})
export class MenuService {


  public pages: Page[] = [
    {
      name: marker('Map'),
      link: '/map-config',
      icon: 'map',
      tooltip: marker('Map'),
      enabled: true,
      control: this.mainFormService.mapConfig.control
    },
    {
      name: marker('Timeline'),
      link: '/timeline-config',
      icon: 'schedule',
      tooltip: marker('Timeline'),
      enabled: false,
      control: this.mainFormService.timelineConfig.control
    },
    {
      name: marker('Search'),
      link: '/search-config',
      icon: 'search',
      tooltip: marker('Search'),
      enabled: false,
      control: this.mainFormService.searchConfig.control
    },
    {
      name: marker('Analytics'),
      link: '/analytics-config',
      icon: 'bar_chart',
      tooltip: marker('Analytics'),
      enabled: false,
      control: this.mainFormService.analyticsConfig.control
    },
    {
      name: marker('Data table'),
      link: '/data-table-config',
      icon: 'data_table',
      tooltip: marker('Data table'),
      enabled: false,
      control: this.mainFormService.resultListConfig.control
    },
    {
      name: marker('Share and Tag'),
      link: '/share-and-tag',
      icon: 'share',
      tooltip: marker('Share and Tag'),
      enabled: false,
      control: this.mainFormService.sideModulesConfig.control
    },
    {
      name: marker('Preferences'),
      link: '/preferences',
      icon: 'settings',
      tooltip: marker('Preferences'),
      enabled: false,
      control: this.mainFormService.lookAndFeelConfig.control
    }
  ];

  public constructor(private mainFormService: MainFormService,
    private arlasSettingsService: ArlasSettingsService) {
    if (this.arlasSettingsService.settings['external_node_page']) {
      this.pages.push({
        name: marker('Extra modules'),
        link: '/extra-modules',
        icon: 'widgets',
        tooltip: marker('Extra modules'),
        enabled: false,
        control: this.mainFormService.externalNodeConfig.control
      });
    }
  }

  public updatePagesStatus(status: boolean) {
    this.pages.forEach(page => page.enabled = status);
  }

}
