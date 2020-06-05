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
import { FormArray, FormGroup } from '@angular/forms';
import { MapGlobalFormGroup } from '@map-config/services/map-global-form-builder/map-global-form-builder.service';
import { SearchGlobalFormGroup } from '@search-config/services/search-global-form-builder/search-global-form-builder.service';
import { TimelineGlobalFormGroup } from '@timeline-config/services/timeline-global-form-builder/timeline-global-form-builder.service';
import {
  LookAndFeelGlobalFormGroup
} from '@look-and-feel-config/services/look-and-feel-global-form-builder/look-and-feel-global-form-builder.service';
import {
  SideModulesGlobalFormGroup
} from '@side-modules-config/services/side-modules-global-form-builder/side-modules-global-form-builder.service';


enum MAIN_FORM_KEYS {
  STARTING_CONFIG = 'StartingConfig',
  MAP_CONFIG = 'MapConfig',
  MAP_CONFIG_LAYERS = 'MapConfigLayers',
  MAP_CONFIG_GLOBAL = 'MapConfigGlobal',
  SEARCH_CONFIG = 'SearchConfig',
  SEARCH_CONFIG_GLOBAL = 'SearchConfigGlobal',
  TIMELINE_CONFIG = 'TimelineConfig',
  TIMELINE_CONFIG_GLOBAL = 'TimelineConfigGlobal',
  ANALYTICS_CONFIG = 'AnalyticsConfig',
  ANALYTICS_CONFIG_LIST = 'AnalyticsConfigList',
  COMMON_CONFIG = 'CommonConfig',
  COMMON_CONFIG_KEYS_TO_COLOR = 'CommonConfigKeysToColor',
  SIDE_MODULES_CONFIG = 'SideModulesConfig',
  SIDE_MODULES_CONFIG_GLOBAL = 'SideModulesConfigGlobal',
  LOOK_AND_FEEL_CONFIG = 'LookAndFeelConfig',
  LOOK_AND_FEEL_CONFIG_GLOBAL = 'LookAndFeelConfigGlobal'
}

@Injectable({
  providedIn: 'root'
})
export class MainFormService {

  public mainForm = new FormGroup({
    [MAIN_FORM_KEYS.STARTING_CONFIG]: new FormGroup({}),
    [MAIN_FORM_KEYS.COMMON_CONFIG]: new FormGroup({}),
    [MAIN_FORM_KEYS.MAP_CONFIG]: new FormGroup({}),
    [MAIN_FORM_KEYS.TIMELINE_CONFIG]: new FormGroup({}),
    [MAIN_FORM_KEYS.SEARCH_CONFIG]: new FormGroup({}),
    [MAIN_FORM_KEYS.SIDE_MODULES_CONFIG]: new FormGroup({}),
    [MAIN_FORM_KEYS.ANALYTICS_CONFIG]: new FormGroup({}),
    [MAIN_FORM_KEYS.LOOK_AND_FEEL_CONFIG]: new FormGroup({})
  });

  constructor() {
  }

  // STARTING FORM
  public startingConfig = new class {
    constructor(public mainForm: FormGroup) { }

    public init(control: FormGroup) {
      this.mainForm.setControl(MAIN_FORM_KEYS.STARTING_CONFIG, control);
    }
    public getFg = () => this.mainForm.get(MAIN_FORM_KEYS.STARTING_CONFIG) as FormGroup;

  }(this.mainForm);

  // MAP CONFIG
  public mapConfig = new class {
    constructor(public control: FormGroup) { }

    public initGlobalFg = (fg: MapGlobalFormGroup) => this.control.setControl(MAIN_FORM_KEYS.MAP_CONFIG_GLOBAL, fg);
    public initLayersFa = (fa: FormArray) => this.control.setControl(MAIN_FORM_KEYS.MAP_CONFIG_LAYERS, fa);
    public getGlobalFg = () => this.control.get(MAIN_FORM_KEYS.MAP_CONFIG_GLOBAL) as MapGlobalFormGroup;
    public getLayersFa = () => this.control.get(MAIN_FORM_KEYS.MAP_CONFIG_LAYERS) as FormArray;

  }(this.mainForm.get(MAIN_FORM_KEYS.MAP_CONFIG) as FormGroup);

  // TIMELINE CONFIG
  public timelineConfig = new class {
    constructor(public control: FormGroup) { }

    public initGlobalFg = (fg: TimelineGlobalFormGroup) => this.control.setControl(MAIN_FORM_KEYS.TIMELINE_CONFIG_GLOBAL, fg);
    public getGlobalFg = () => this.control.get(MAIN_FORM_KEYS.TIMELINE_CONFIG_GLOBAL) as TimelineGlobalFormGroup;

  }(this.mainForm.get(MAIN_FORM_KEYS.TIMELINE_CONFIG) as FormGroup);

  // SEARCH CONFIG
  public searchConfig = new class {
    constructor(public control: FormGroup) { }

    public initGlobalFg = (fg: SearchGlobalFormGroup) => this.control.setControl(MAIN_FORM_KEYS.SEARCH_CONFIG_GLOBAL, fg);
    public getGlobalFg = () => this.control.get(MAIN_FORM_KEYS.SEARCH_CONFIG_GLOBAL) as SearchGlobalFormGroup;

  }(this.mainForm.get(MAIN_FORM_KEYS.SEARCH_CONFIG) as FormGroup);

  // ANALYTICS CONFIG
  public analyticsConfig = new class {
    constructor(public control: FormGroup) { }

    public initListFa = (fa: FormArray) => this.control.setControl(MAIN_FORM_KEYS.ANALYTICS_CONFIG_LIST, fa);
    public getListFa = () => this.control.get(MAIN_FORM_KEYS.ANALYTICS_CONFIG_LIST) as FormArray;

  }(this.mainForm.get(MAIN_FORM_KEYS.ANALYTICS_CONFIG) as FormGroup);

  // SIDE MODULES CONFIG
  public sideModulesConfig = new class {
    constructor(public control: FormGroup) { }

    public initGlobalFg = (fg: SideModulesGlobalFormGroup) => this.control.setControl(MAIN_FORM_KEYS.SIDE_MODULES_CONFIG_GLOBAL, fg);
    public getGlobalFg = () => this.control.get(MAIN_FORM_KEYS.SIDE_MODULES_CONFIG_GLOBAL) as SideModulesGlobalFormGroup;
  }(this.mainForm.get(MAIN_FORM_KEYS.SIDE_MODULES_CONFIG) as FormGroup);

  // LOOK AND FEEL CONFIG
  public lookAndFeelConfig = new class {
    constructor(public control: FormGroup) { }

    public initGlobalFg = (fg: LookAndFeelGlobalFormGroup) => this.control.setControl(MAIN_FORM_KEYS.LOOK_AND_FEEL_CONFIG_GLOBAL, fg);
    public getGlobalFg = () => this.control.get(MAIN_FORM_KEYS.LOOK_AND_FEEL_CONFIG_GLOBAL) as LookAndFeelGlobalFormGroup;
  }(this.mainForm.get(MAIN_FORM_KEYS.LOOK_AND_FEEL_CONFIG) as FormGroup);

  // COMMON CONFIG
  public commonConfig = new class {
    constructor(public control: FormGroup) { }

    public initKeysToColorFa = (fa: FormArray) => this.control.setControl(MAIN_FORM_KEYS.COMMON_CONFIG_KEYS_TO_COLOR, fa);
    public getKeysToColorFa = () => this.control.get(MAIN_FORM_KEYS.COMMON_CONFIG_KEYS_TO_COLOR) as FormArray;

  }(this.mainForm.get(MAIN_FORM_KEYS.COMMON_CONFIG) as FormGroup);

  // OTHER METHODS ...
  public resetMainForm() {
    // keep the existing instances of the main config FormGroup as all *config
    // (mapConfig, analyticsConfig...) keep the initial related instance
    [
      this.mainForm.get(MAIN_FORM_KEYS.STARTING_CONFIG),
      this.mainForm.get(MAIN_FORM_KEYS.MAP_CONFIG),
      this.mainForm.get(MAIN_FORM_KEYS.TIMELINE_CONFIG),
      this.mainForm.get(MAIN_FORM_KEYS.SEARCH_CONFIG),
      this.mainForm.get(MAIN_FORM_KEYS.ANALYTICS_CONFIG),
      this.mainForm.get(MAIN_FORM_KEYS.SIDE_MODULES_CONFIG),
      this.mainForm.get(MAIN_FORM_KEYS.LOOK_AND_FEEL_CONFIG),
      this.mainForm.get(MAIN_FORM_KEYS.COMMON_CONFIG),
    ].forEach((sf: FormGroup) => {
      Object.keys(sf.controls).forEach(c => sf.removeControl(c));
    });
  }

  public getCollections(): string[] {
    if (!!this.startingConfig.getFg() && !!this.startingConfig.getFg().get('collections')) {
      return this.startingConfig.getFg().get('collections').value;
    }
    return [];
  }

}
