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
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { MainFormService } from '@services/main-form/main-form.service';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/internal/operators/filter';
import { map } from 'rxjs/operators';
import { MainFormManagerService } from '@services/main-form-manager/main-form-manager.service';
import { isFullyTouched } from '@utils/tools';

interface Tab {
  routeurLink: string;
  label: string;
  hasError: () => boolean;
}

@Component({
  selector: 'app-map-config',
  templateUrl: './map-config.component.html',
  styleUrls: ['./map-config.component.scss']
})
export class MapConfigComponent implements OnInit {

  constructor(
    private mainFormService: MainFormService,
    private translate: TranslateService,
    private router: Router) {

      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd),
          map(navEnd => (navEnd as NavigationEnd).urlAfterRedirects))
        .subscribe(url => this.activeTab = this.tabs.find(tabs => url.indexOf(tabs.routeurLink) > 0));
    }


  public tabs: Tab[] = [
    {
      routeurLink: 'global', label: 'Global configuration',
      hasError: () => !!this.mainFormService.mapConfig.getGlobalFg()
        && this.mainFormService.mapConfig.getGlobalFg().invalid
        && isFullyTouched(this.mainFormService.mapConfig.getGlobalFg())
    },
    {
      routeurLink: 'layers', label: 'Layers',
      hasError: () => !!this.mainFormService.mapConfig.getLayersFa()
        && this.mainFormService.mapConfig.getLayersFa().invalid
        && isFullyTouched(this.mainFormService.mapConfig.getLayersFa())
    }
    ,
    {
      routeurLink: 'preview', label: 'Preview',
      hasError: () => !!this.mainFormService.mapConfig.getLayersFa()
        && this.mainFormService.mapConfig.getLayersFa().invalid
        && isFullyTouched(this.mainFormService.mapConfig.getLayersFa())
    }
  ];

  public activeTab = this.tabs[0];

  public ngOnInit() {}

}
