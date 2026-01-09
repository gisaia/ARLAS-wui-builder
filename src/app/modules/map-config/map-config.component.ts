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
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MainFormService } from '@services/main-form/main-form.service';
import { isFullyTouched } from '@utils/tools';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/internal/operators/filter';
import { map } from 'rxjs/operators';

interface Tab {
  routeurLink: string;
  label: string;
  hasError: () => boolean;
}

@Component({
    selector: 'arlas-map-config',
    templateUrl: './map-config.component.html',
    styleUrls: ['./map-config.component.scss'],
    standalone: false
})
export class MapConfigComponent implements OnInit, OnDestroy {

  private routerSub: Subscription;

  public constructor(
    private readonly mainFormService: MainFormService,
    private readonly router: Router) { }


  public tabs: Tab[] = [
    {
      routeurLink: 'global', label: 'Global configuration',
      hasError: () => !!this.mainFormService.mapConfig.getGlobalFg()
        && this.mainFormService.mapConfig.getGlobalFg().invalid
        && isFullyTouched(this.mainFormService.mapConfig.getGlobalFg())
    },
    {
      routeurLink: 'visualisations', label: 'Visualisation sets',
      hasError: () => !!this.mainFormService.mapConfig.getVisualisationsFa()
        && this.mainFormService.mapConfig.getVisualisationsFa().invalid
        && isFullyTouched(this.mainFormService.mapConfig.getVisualisationsFa())
    },
    {
      routeurLink: 'layers', label: 'Layers',
      hasError: () => !!this.mainFormService.mapConfig.getLayersFa()
        && this.mainFormService.mapConfig.getLayersFa().invalid
        && isFullyTouched(this.mainFormService.mapConfig.getLayersFa())
    },
    {
      routeurLink: 'basemaps', label: 'Basemaps',
      hasError: () => !!this.mainFormService.mapConfig.getBasemapsFg()
        && this.mainFormService.mapConfig.getBasemapsFg().invalid
        && isFullyTouched(this.mainFormService.mapConfig.getBasemapsFg())
    },
    {
      routeurLink: 'preview', label: 'Preview',
      hasError: () => !!this.mainFormService.mapConfig.getLayersFa()
        && this.mainFormService.mapConfig.getLayersFa().invalid
        && isFullyTouched(this.mainFormService.mapConfig.getLayersFa())
    }
  ];

  public activeTab = this.tabs[0];

  public ngOnInit() {
    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd),
        map(navEnd => navEnd.urlAfterRedirects))
      .subscribe(url => this.activeTab = this.tabs.find(tabs => url.indexOf(tabs.routeurLink) > 0));
  }

  public ngOnDestroy() {
    this.routerSub.unsubscribe();
  }

}
