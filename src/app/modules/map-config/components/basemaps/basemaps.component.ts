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
import { ArlasSettingsService } from 'arlas-wui-toolkit/services/settings/arlas.settings.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { FormControl, FormArray, FormGroup } from '@angular/forms';
import { MatRadioChange } from '@angular/material';
import { HiddenFormControl } from '../../../../shared/models/config-form';

@Component({
  selector: 'app-basemaps',
  templateUrl: './basemaps.component.html',
  styleUrls: ['./basemaps.component.scss']
})
export class BasemapsComponent implements OnInit {

  public basemapFa: FormArray;
  public defaultBasemap: HiddenFormControl;
  public basemaps: Basemap[] = [];

  constructor(
    private settingsService: ArlasSettingsService,
    private mainformService: MainFormService
  ) { }

  public ngOnInit() {
    const mapBasemapFg = this.mainformService.mapConfig.getBasemapsFg();
    this.basemapFa = mapBasemapFg.customControls.basemaps;
    this.defaultBasemap = mapBasemapFg.customControls.default;

    const existingBasemap = this.basemapFa.controls.map((fg: FormGroup) => fg.value.name);
    (this.settingsService.settings as any).basemaps.forEach((basemap: Basemap) => {
      // check if selected in editing config and checked it
      basemap.checked = existingBasemap.indexOf(basemap.name) >= 0;
      basemap.default = this.defaultBasemap.value === basemap.name;
      this.basemaps.push(basemap);
    });
    // If no basemap selected, select the first one
    const activeBasemaps = this.basemaps.filter(b => b.checked === true);
    if (activeBasemaps.length === 0) {
      this.basemaps[0].checked = true;
      this.basemapFa.push(
        new FormGroup({
          name: new FormControl(this.basemaps[0].name),
          url: new FormControl(this.basemaps[0].url)
        })
      );
    }
    // Set first by default
    const defaultBasemap = this.basemaps.filter(b => b.default === true);
    if (defaultBasemap.length === 0) {
      this.basemaps[0].default = true;
      this.defaultBasemap.setValue(this.basemaps[0].name);
    }
  }

  public toggleBasemap(event: MatCheckboxChange) {

    this.basemaps.map(basemap => {
      if (basemap.name === event.source.value) {
        basemap.checked = event.checked;
      }
    });
    this.basemapFa.clear();
    const selectedBasemaps = this.basemaps.filter(b => b.checked === true);
    if (selectedBasemaps.length > 0) {
      selectedBasemaps.map(b => this.basemapFa.push(
        new FormGroup({
          name: new FormControl(b.name),
          url: new FormControl(b.url)
        })
      ));
    } else {
      this.basemapFa.push(
        new FormGroup({
          name: new FormControl(this.basemaps[0].name),
          url: new FormControl(this.basemaps[0].url)
        })
      );
    }
  }

  public setDefault(event: MatRadioChange) {
    this.basemaps.map(basemap => {
      basemap.default = (basemap.name === event.value);
    });
    this.defaultBasemap.setValue(event.value);
  }
}

export interface Basemap {
  name: string;
  url: string;
  image: string;
  checked: boolean;
  default: boolean;
}
