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
import { Injectable } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { Page } from '@utils/tools';
import { MainFormService } from '@services/main-form/main-form.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(private mainFormService: MainFormService) { }

  public pages: Page[] = [
    {
      name: marker('Map'),
      link: '/map-config',
      icon: 'map',
      tooltip: marker('Map'),
      enabled: false,
      control: this.mainFormService.mapConfig.control
    },
    {
      name: marker('Timeline'),
      link: '/timeline-config',
      icon: 'history_toggle_off',
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
      name: marker('Side modules'),
      link: '/side-modules',
      icon: 'view_column',
      tooltip: marker('Side modules'),
      enabled: false,
      control: this.mainFormService.sideModulesConfig.control
    },
    {
      name: marker('Look \'n feel'),
      link: '/look-and-feel',
      icon: 'opacity',
      tooltip: marker('Look \'n feel'),
      enabled: false,
      control: this.mainFormService.lookAndFeelConfig.control
    },
  ];

  public updatePagesStatus(status: boolean) {
    this.pages.forEach(page => page.enabled = status);
  }

}
