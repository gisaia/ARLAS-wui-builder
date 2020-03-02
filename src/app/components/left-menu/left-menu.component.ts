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
import { Component } from '@angular/core';

interface Page {
  link: string;
  name: string;
  icon: string;
  tooltip: string;
  enabled: boolean;
}

@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss']
})
export class LeftMenuComponent {

  constructor() { }

  public isLabelDisplayed = true;

  public pages: Page[] = [
    { name: 'Map', link: '/map-config', icon: 'map', tooltip: 'Map configuration', enabled: true },
    { name: 'Timeline', link: '/timeline-config', icon: 'timeline', tooltip: 'Timeline configuration', enabled: true },
    { name: 'Search', link: '/search-config', icon: 'search', tooltip: 'Search configuration', enabled: true },
    { name: 'Analytics', link: 'some-link', icon: 'bar_chart', tooltip: 'Analytics configuration', enabled: false },
    { name: 'Look \'n feel', link: 'some-link', icon: 'send', tooltip: 'Look \'n fell configuration', enabled: false },
  ];
}
