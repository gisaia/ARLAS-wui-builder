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
import { Component, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatRadioChange } from '@angular/material/radio';
import { MainFormService } from '@services/main-form/main-form.service';
import { HiddenFormControl } from '@shared-models/config-form';
import { ArlasSettingsService } from 'arlas-wui-toolkit';
import { MapBasemapFormGroup, BasemapFormGroup } from '@map-config/services/map-basemap-form-builder/map-basemap-form-builder.service';

@Component({
  selector: 'arlas-basemaps',
  templateUrl: './basemaps.component.html',
  styleUrls: ['./basemaps.component.scss']
})
export class BasemapsComponent implements OnInit {

  public basemapFa: FormArray;
  public basemaps: Basemap[] = [];
  public defaultBasemapFc: HiddenFormControl;

  public constructor(
    private settingsService: ArlasSettingsService,
    private mainformService: MainFormService
  ) { }

  public ngOnInit() {
    const mapBasemapFg = this.mainformService.mapConfig.getBasemapsFg();
    this.initBasemaps(mapBasemapFg);
  }

  public initBasemaps(mapBasemapFg: MapBasemapFormGroup) {
    this.basemapFa = mapBasemapFg.customControls.basemaps;
    this.defaultBasemapFc = mapBasemapFg.customControls.default;
    const basemapsFromConfig = new Set(this.basemapFa.controls.map((fg: FormGroup) => fg.value.name));
    // Init list of basemap with a default if not defined
    let basemaps: Basemap[] = [];
    if (!!(this.settingsService.settings as any).basemaps) {
      basemaps = (this.settingsService.settings as any).basemaps;
    } else {
      basemaps.push({
        name: 'Positron',
        url: 'https://api.maptiler.com/maps/positron/style.json?key=xIhbu1RwgdbxfZNmoXn4',
        image: 'https://api.maptiler.com/maps/8bb9093c-9865-452b-8be4-7a397f552b49/0/0/0.png?key=kO3nZIVLnPvIVn8AEnuk',
        checked: true,
        default: true,
        type: 'mapbox'
      });
    }
    basemaps.forEach((basemap: Basemap) => {
      // check if selected in editing config and checked it
      basemap.checked = basemapsFromConfig.has(basemap.name);
      basemap.default = this.defaultBasemapFc.value === basemap.name;
      this.basemaps.push(basemap);
    });

    // If no basemap selected, select the first one
    const activeBasemaps = this.basemaps.filter(b => b.checked === true);
    if (activeBasemaps.length === 0) {
      this.basemaps[0].checked = true;
      this.basemapFa.push(new BasemapFormGroup(this.basemaps[0].name, this.basemaps[0].url, this.basemaps[0].image, this.basemaps[0].type));
    }
    // Set first by default
    const defaultBasemap = this.basemaps.filter(b => b.default === true);
    if (defaultBasemap.length === 0) {
      this.basemaps[0].default = true;
      this.defaultBasemapFc.setValue(this.basemaps[0].name);
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
        new BasemapFormGroup(b.name, b.url, b.image, b.type)
      ));
    } else {
      const b = this.basemaps[0];
      this.basemapFa.push(
        new BasemapFormGroup(b.name, b.url, b.image, b.type)
      );
    }
  }

  public setDefaultBasemap(event: MatRadioChange) {
    this.basemaps.map(basemap => {
      basemap.default = (basemap.name === event.value);
    });
    this.defaultBasemapFc.setValue(event.value);
  }
}

export interface Basemap {
  name: string;
  url: string;
  image: string;
  checked: boolean;
  default: boolean;
  type: string;
}
