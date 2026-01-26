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
import { FormArray, FormControl } from '@angular/forms';
import { marker } from '@colsen1991/ngx-translate-extract-marker';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { ArlasBuilderSettings } from '@services/startup/startup.service';
import { ConfigFormGroup, HiddenFormControl, InputFormControl, SlideToggleFormControl } from '@shared-models/config-form';
import { ArlasSettingsService } from 'arlas-wui-toolkit';

export class MapBasemapFormGroup extends ConfigFormGroup {
  public constructor(settingsService: ArlasSettingsService) {
    super({
      basemaps: new FormArray<BasemapFormGroup>([]),
      default: new HiddenFormControl('', null),
      terrain: new ConfigFormGroup({
        enable: new SlideToggleFormControl(
          false,
          marker('Enable terrain'),
          marker('Enable terrain description')
        ),
        exaggeration: new InputFormControl(
          1,
          marker('Terrain exaggeration'),
          marker('Terrain exaggeration descritpion'),
          'number',
          {
            dependsOn: () => [this.customControls.terrain.enable],
            onDependencyChange: (control) => control.enableIf(!!this.customControls.terrain.enable.value)
          }
        ),
        source: new HiddenFormControl((settingsService.getSettings() as ArlasBuilderSettings).terrain)
      }).withTitle(marker('Terrain'))
    });
  }

  public customControls = {
    default: this.get('default') as HiddenFormControl,
    basemaps: this.get('basemaps') as FormArray<BasemapFormGroup>,
    terrain: {
      enable: this.get('terrain').get('enable') as SlideToggleFormControl,
      exaggeration: this.get('terrain').get('exaggeration') as InputFormControl,
      source: this.get('terrain').get('source') as HiddenFormControl
    }
  };
}

export class BasemapFormGroup extends ConfigFormGroup {
  public constructor(name: string, url: string, image: string, type?: string) {
    super({
      name: new FormControl(name),
      url: new FormControl(url),
      image: new FormControl(image),
      type: new FormControl(type)
    });
  }

  public customControls = {
    name: this.get('name') as FormControl,
    url: this.get('url') as FormControl,
    image: this.get('image') as FormControl,
    type: this.get('type') as FormControl
  };
}


@Injectable({
  providedIn: 'root'
})
export class MapBasemapFormBuilderService {

  public constructor(
    private defaultValuesService: DefaultValuesService,
    private settingsService: ArlasSettingsService
  ) { }

  public build() {
    const mapBasemapFormGroup = new MapBasemapFormGroup(this.settingsService);
    this.defaultValuesService.setDefaultValueRecursively('map.basemap', mapBasemapFormGroup);
    return mapBasemapFormGroup;
  }

  public buildBasemapFormArray(name: string, url: string, image: string, type: string): BasemapFormGroup {
    return new BasemapFormGroup(name, url, image, type);
  }
}
