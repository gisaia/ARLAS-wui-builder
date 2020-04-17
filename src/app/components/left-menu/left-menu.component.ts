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
import { Component, ViewContainerRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MainFormImportExportService } from '@services/main-form-import-export/main-form-import-export.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { getNbErrorsInControl } from '@utils/tools';

interface Page {
  link: string;
  name: string;
  icon: string;
  tooltip: string;
  enabled: boolean;
  control?: AbstractControl;
}

@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss']
})
export class LeftMenuComponent {

  public isLabelDisplayed = true;
  public nbErrorsByPage: Map<string, number> = new Map();

  constructor(
    private mainFormService: MainFormService,
    private importExportService: MainFormImportExportService,
    private vcref: ViewContainerRef,
    private translate: TranslateService
  ) {
    // recompute nberrors of each page anytime the mainform validity changes
    this.mainFormService.mainForm.statusChanges.subscribe(st => this.updateNbErrors());
  }

  public pages: Page[] = [
    {
      name: 'Map',
      link: '/map-config',
      icon: 'map',
      tooltip: this.translate.instant('Map configuration'),
      enabled: true,
      control: this.mainFormService.mapConfig.control
    },
    {
      name: 'Timeline',
      link: '/timeline-config',
      icon: 'timeline',
      tooltip: this.translate.instant('Timeline configuration'),
      enabled: true,
      control: this.mainFormService.timelineConfig.control
    },
    {
      name: 'Search',
      link: '/search-config',
      icon: 'search',
      tooltip: this.translate.instant('Search configuration'),
      enabled: true,
      control: this.mainFormService.searchConfig.control
    },
    {
      name: 'Analytics',
      link: '/analytics-config',
      icon: 'bar_chart',
      tooltip: this.translate.instant('Analytics configuration'),
      enabled: true,
      control: this.mainFormService.analyticsConfig.control
    },
    {
      name: 'Look \'n feel',
      link: 'some-link',
      icon: 'send',
      tooltip: this.translate.instant('Look \'n fell configuration'),
      enabled: false
    },
  ];

  private updateNbErrors() {
    this.nbErrorsByPage.clear();
    this.pages
      .filter(p => this.importExportService.isExportExpected && !!p.control && !p.control.valid)
      .forEach(p =>
        this.nbErrorsByPage.set(p.name, getNbErrorsInControl(p.control))
      );
  }

  public save() {
    this.importExportService.attemptExport(this.vcref);
    this.updateNbErrors();
  }

}
