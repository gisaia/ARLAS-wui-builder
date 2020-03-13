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
import { Component, OnInit } from '@angular/core';
import { MainFormService } from '@services/main-form/main-form.service';
import { MainFormImportExportService } from '@services/main-form-import-export/main-form-import-export.service';
import { TranslateService } from '@ngx-translate/core';

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
    private importExportService: MainFormImportExportService,
    private translate: TranslateService) { }

  public tabs: Tab[] = [
    {
      routeurLink: 'global', label: this.translate.instant('Global configuration'),
      hasError: () => this.importExportService.isExportExpected &&
        this.mainFormService.mapConfig.getGlobalFg() && !this.mainFormService.mapConfig.getGlobalFg().valid
    },
    {
      routeurLink: 'layers', label: this.translate.instant('Layers'),
      hasError: () => this.importExportService.isExportExpected && this.mainFormService.mapConfig.getLayersFa()
        && !this.mainFormService.mapConfig.getLayersFa().valid
    }
  ];

  public activeTab = this.tabs[0];

  ngOnInit() {
  }

}
