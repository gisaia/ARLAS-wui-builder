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
  ANALYTICS_CONFIG_LIST = 'AnalyticsConfigList'
}

@Injectable({
  providedIn: 'root'
})
export class MainFormService {

  public mainForm = this.getMainEmptyFormGroup();

  // In sub configs, init() methods should only use `registerControl()` method.
  // It doesn't replace the control, so it avoids to overwrite any existing value by reopening a page

  // STARTING FORM
  public startingConfig = new class {
    constructor(public mainForm: FormGroup) { }

    public init(control: FormGroup) {
      this.mainForm.reset();
      this.mainForm.setControl(MAIN_FORM_KEYS.STARTING_CONFIG, control);
    }
    public getFg = () => this.mainForm.get(MAIN_FORM_KEYS.STARTING_CONFIG) as FormGroup;

  }(this.mainForm);

  // MAP CONFIG
  public mapConfig = new class {
    constructor(public control: FormGroup) { }

    public initGlobalFg = (fg: FormGroup) => this.control.registerControl(MAIN_FORM_KEYS.MAP_CONFIG_GLOBAL, fg);
    public initLayersFa = (fa: FormArray) => this.control.registerControl(MAIN_FORM_KEYS.MAP_CONFIG_LAYERS, fa);
    public getGlobalFg = () => this.control.get(MAIN_FORM_KEYS.MAP_CONFIG_GLOBAL) as FormGroup;
    public getLayersFa = () => this.control.get(MAIN_FORM_KEYS.MAP_CONFIG_LAYERS) as FormArray;

  }(this.mainForm.get(MAIN_FORM_KEYS.MAP_CONFIG) as FormGroup);

  // SEARCH CONFIG
  public searchConfig = new class {
    constructor(public control: FormGroup) { }

    public initGlobalFg = (fg: FormGroup) => this.control.registerControl(MAIN_FORM_KEYS.SEARCH_CONFIG_GLOBAL, fg);
    public getGlobalFg = () => this.control.get(MAIN_FORM_KEYS.SEARCH_CONFIG_GLOBAL) as FormGroup;

  }(this.mainForm.get(MAIN_FORM_KEYS.SEARCH_CONFIG) as FormGroup);

  // TIMELINE CONFIG
  public timelineConfig = new class {
    constructor(public control: FormGroup) { }

    public initGlobalFg = (fg: FormGroup) => this.control.registerControl(MAIN_FORM_KEYS.TIMELINE_CONFIG_GLOBAL, fg);
    public getGlobalFg = () => this.control.get(MAIN_FORM_KEYS.TIMELINE_CONFIG_GLOBAL) as FormGroup;

  }(this.mainForm.get(MAIN_FORM_KEYS.TIMELINE_CONFIG) as FormGroup);

  // ANALYTICS CONFIG
  public analyticsConfig = new class {
    constructor(public control: FormGroup) { }

    public initListFa = (fa: FormArray) => this.control.registerControl(MAIN_FORM_KEYS.ANALYTICS_CONFIG_LIST, fa);
    public getListFa = () => this.control.get(MAIN_FORM_KEYS.ANALYTICS_CONFIG_LIST) as FormArray;

  }(this.mainForm.get(MAIN_FORM_KEYS.ANALYTICS_CONFIG) as FormGroup);

  // OTHER METHODS ...

  public resetMainForm() {
    Object.keys(this.mainForm.controls).forEach(c => this.mainForm.removeControl(c));
    this.mainForm = this.getMainEmptyFormGroup();
  }

  public getCollections(): string[] {
    if (!!this.startingConfig.getFg() && !!this.startingConfig.getFg().get('collections')) {
      return this.startingConfig.getFg().get('collections').value;
    }
    return [];
  }

  private getMainEmptyFormGroup() {
    return new FormGroup({
      [MAIN_FORM_KEYS.STARTING_CONFIG]: new FormGroup({}),
      [MAIN_FORM_KEYS.MAP_CONFIG]: new FormGroup({}),
      [MAIN_FORM_KEYS.SEARCH_CONFIG]: new FormGroup({}),
      [MAIN_FORM_KEYS.TIMELINE_CONFIG]: new FormGroup({}),
      [MAIN_FORM_KEYS.ANALYTICS_CONFIG]: new FormGroup({})
    });
  }

  constructor(
  ) { }

}
