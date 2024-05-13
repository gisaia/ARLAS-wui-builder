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
import { StartingConfigFormGroup } from '@services/starting-config-form-builder/starting-config-form-builder.service';
import { Subject } from 'rxjs/internal/Subject';
import { MapBasemapFormGroup } from '@map-config/services/map-basemap-form-builder/map-basemap-form-builder.service';
import { DataWithLinks } from 'arlas-persistence-api';
import { ResourcesConfigFormGroup } from '@services/resources-form-builder/resources-config-form-builder.service';


enum MAIN_FORM_KEYS {
  STARTING_CONFIG = 'StartingConfig',
  RESOURCES_CONFIG = 'ResourcesConfig',
  MAP_CONFIG = 'MapConfig',
  MAP_CONFIG_LAYERS = 'MapConfigLayers',
  MAP_CONFIG_VISUALISATIONS = 'MapConfigVisualisations',
  MAP_CONFIG_BASAMAPS = 'MapConfigBasemaps',
  MAP_CONFIG_GLOBAL = 'MapConfigGlobal',
  SEARCH_CONFIG = 'SearchConfig',
  SEARCH_CONFIG_GLOBAL = 'SearchConfigGlobal',
  TIMELINE_CONFIG = 'TimelineConfig',
  TIMELINE_CONFIG_GLOBAL = 'TimelineConfigGlobal',
  ANALYTICS_CONFIG = 'AnalyticsConfig',
  ANALYTICS_CONFIG_LIST = 'AnalyticsConfigList',
  SHORTCUTS_CONFIG = 'ShortcutsConfig',
  SHORTCUTS_CONFIG_LIST = 'ShortcutsConfigList',
  COMMON_CONFIG = 'CommonConfig',
  COMMON_CONFIG_KEYS_TO_COLOR = 'CommonConfigKeysToColor',
  SIDE_MODULES_CONFIG = 'SideModulesConfig',
  SIDE_MODULES_CONFIG_GLOBAL = 'SideModulesConfigGlobal',
  LOOK_AND_FEEL_CONFIG = 'LookAndFeelConfig',
  LOOK_AND_FEEL_CONFIG_GLOBAL = 'LookAndFeelConfigGlobal',
  RESULT_LIST_CONFIG = 'ResultListConfig',
  RESULT_LIST_CONFIG_GLOBAL = 'ResultListConfig',
  RESULT_LIST_CONFIG_LISTS = 'ResultListConfigLists',
  EXTERNAL_NODE_CONFIG = 'ExternalNodeConfig',
  EXTERNAL_NODE_CONFIG_GLOBAL = 'ExternalNodeGlobal'
}

export const ARLAS_ID = 'arlas_id:';

@Injectable({
  providedIn: 'root'
})
export class MainFormService {

  public configurationId: string;

  public configurationName: string;

  public configChange: Subject<{ id: string; name: string; }> = new Subject<{ id: string; name: string; }>();

  public mainForm = new FormGroup({
    [MAIN_FORM_KEYS.STARTING_CONFIG]: new FormGroup({}),
    [MAIN_FORM_KEYS.RESOURCES_CONFIG]: new FormGroup({}),
    [MAIN_FORM_KEYS.COMMON_CONFIG]: new FormGroup({}),
    [MAIN_FORM_KEYS.MAP_CONFIG]: new FormGroup({}),
    [MAIN_FORM_KEYS.TIMELINE_CONFIG]: new FormGroup({}),
    [MAIN_FORM_KEYS.SEARCH_CONFIG]: new FormGroup({}),
    [MAIN_FORM_KEYS.SIDE_MODULES_CONFIG]: new FormGroup({}),
    [MAIN_FORM_KEYS.ANALYTICS_CONFIG]: new FormGroup({}),
    [MAIN_FORM_KEYS.LOOK_AND_FEEL_CONFIG]: new FormGroup({}),
    [MAIN_FORM_KEYS.RESULT_LIST_CONFIG]: new FormGroup({}),
    [MAIN_FORM_KEYS.EXTERNAL_NODE_CONFIG]: new FormGroup({})

  });

  // STARTING FORM
  public startingConfig = new class {
    public constructor(public mainForm: FormGroup) { }

    public init(control: StartingConfigFormGroup) {
      this.mainForm.setControl(MAIN_FORM_KEYS.STARTING_CONFIG, control);
    }
    public getFg = () => this.mainForm.get(MAIN_FORM_KEYS.STARTING_CONFIG) as StartingConfigFormGroup;

  }(this.mainForm);

  public resourcesConfig = new class {
    public constructor(public mainForm: FormGroup) { }

    public init(control: ResourcesConfigFormGroup) {
      this.mainForm.setControl(MAIN_FORM_KEYS.RESOURCES_CONFIG, control);
    }
    public getFg = () => this.mainForm.get(MAIN_FORM_KEYS.RESOURCES_CONFIG) as ResourcesConfigFormGroup;

  }(this.mainForm);

  // MAP CONFIG
  public mapConfig = new class {
    public constructor(public control: FormGroup) { }
    public initGlobalFg = (fg: MapGlobalFormGroup) => this.control.setControl(MAIN_FORM_KEYS.MAP_CONFIG_GLOBAL, fg);
    public initLayersFa = (fa: FormArray) => this.control.setControl(MAIN_FORM_KEYS.MAP_CONFIG_LAYERS, fa);
    public initVisualisationsFa = (fa: FormArray) => this.control.setControl(MAIN_FORM_KEYS.MAP_CONFIG_VISUALISATIONS, fa);
    public initBasemapsFg = (fg: MapBasemapFormGroup) => this.control.setControl(MAIN_FORM_KEYS.MAP_CONFIG_BASAMAPS, fg);
    public getGlobalFg = () => this.control.get(MAIN_FORM_KEYS.MAP_CONFIG_GLOBAL) as MapGlobalFormGroup;
    public getLayersFa = () => this.control.get(MAIN_FORM_KEYS.MAP_CONFIG_LAYERS) as FormArray;
    public getVisualisationsFa = () => this.control.get(MAIN_FORM_KEYS.MAP_CONFIG_VISUALISATIONS) as FormArray;
    public getBasemapsFg = () => this.control.get(MAIN_FORM_KEYS.MAP_CONFIG_BASAMAPS) as MapBasemapFormGroup;

  }(this.mainForm.get(MAIN_FORM_KEYS.MAP_CONFIG) as FormGroup);

  // TIMELINE CONFIG
  public timelineConfig = new class {
    public constructor(public control: FormGroup) { }

    public initGlobalFg = (fg: TimelineGlobalFormGroup) => this.control.setControl(MAIN_FORM_KEYS.TIMELINE_CONFIG_GLOBAL, fg);
    public getGlobalFg = () => this.control.get(MAIN_FORM_KEYS.TIMELINE_CONFIG_GLOBAL) as TimelineGlobalFormGroup;

  }(this.mainForm.get(MAIN_FORM_KEYS.TIMELINE_CONFIG) as FormGroup);

  // SEARCH CONFIG
  public searchConfig = new class {
    public constructor(public control: FormGroup) { }

    public initGlobalFg = (fg: SearchGlobalFormGroup) => this.control.setControl(MAIN_FORM_KEYS.SEARCH_CONFIG_GLOBAL, fg);
    public getGlobalFg = () => this.control.get(MAIN_FORM_KEYS.SEARCH_CONFIG_GLOBAL) as SearchGlobalFormGroup;

  }(this.mainForm.get(MAIN_FORM_KEYS.SEARCH_CONFIG) as FormGroup);

  // ANALYTICS CONFIG
  public analyticsConfig = new class {
    public constructor(public control: FormGroup) { }
    public initListFa = (fa: FormArray) => this.control.setControl(MAIN_FORM_KEYS.ANALYTICS_CONFIG_LIST, fa);
    public getListFa = () => this.control.get(MAIN_FORM_KEYS.ANALYTICS_CONFIG_LIST) as FormArray;

  }(this.mainForm.get(MAIN_FORM_KEYS.ANALYTICS_CONFIG) as FormGroup);

  // SIDE MODULES CONFIG
  public sideModulesConfig = new class {
    public constructor(public control: FormGroup) { }

    public initGlobalFg = (fg: SideModulesGlobalFormGroup) => this.control.setControl(MAIN_FORM_KEYS.SIDE_MODULES_CONFIG_GLOBAL, fg);
    public getGlobalFg = () => this.control.get(MAIN_FORM_KEYS.SIDE_MODULES_CONFIG_GLOBAL) as SideModulesGlobalFormGroup;
  }(this.mainForm.get(MAIN_FORM_KEYS.SIDE_MODULES_CONFIG) as FormGroup);

  // LOOK AND FEEL CONFIG
  public lookAndFeelConfig = new class {
    public constructor(public control: FormGroup) { }

    public initGlobalFg = (fg: LookAndFeelGlobalFormGroup) => this.control.setControl(MAIN_FORM_KEYS.LOOK_AND_FEEL_CONFIG_GLOBAL, fg);
    public getGlobalFg = () => this.control.get(MAIN_FORM_KEYS.LOOK_AND_FEEL_CONFIG_GLOBAL) as LookAndFeelGlobalFormGroup;
  }(this.mainForm.get(MAIN_FORM_KEYS.LOOK_AND_FEEL_CONFIG) as FormGroup);

  // RESULT LIST CONFIG
  public resultListConfig = new class {
    public constructor(public control: FormGroup) { }

    public initResultListsFa = (fa: FormArray) => this.control.setControl(MAIN_FORM_KEYS.RESULT_LIST_CONFIG_LISTS, fa);
    public getResultListsFa = () => this.control.get(MAIN_FORM_KEYS.RESULT_LIST_CONFIG_LISTS) as FormArray;
  }(this.mainForm.get(MAIN_FORM_KEYS.RESULT_LIST_CONFIG) as FormGroup);

  // EXTERNAL NODE CONFIG
  public externalNodeConfig = new class {
    public constructor(public control: FormGroup) { }

    public initExternalNodeFg = (fg: FormGroup) => this.control.setControl(MAIN_FORM_KEYS.EXTERNAL_NODE_CONFIG_GLOBAL, fg);
    public getExternalNodeFg = () => this.control.get(MAIN_FORM_KEYS.EXTERNAL_NODE_CONFIG_GLOBAL) as FormGroup;
  }(this.mainForm.get(MAIN_FORM_KEYS.EXTERNAL_NODE_CONFIG) as FormGroup);

  // COMMON CONFIG
  public commonConfig = new class {
    public constructor(public control: FormGroup) { }

    public initKeysToColorFa = (fa: FormArray) => this.control.setControl(MAIN_FORM_KEYS.COMMON_CONFIG_KEYS_TO_COLOR, fa);
    public getKeysToColorFa = () => this.control.get(MAIN_FORM_KEYS.COMMON_CONFIG_KEYS_TO_COLOR) as FormArray;

  }(this.mainForm.get(MAIN_FORM_KEYS.COMMON_CONFIG) as FormGroup);

  // OTHER METHODS ...
  public resetMainForm() {
    // keep the existing instances of the main config FormGroup as all *config
    // (mapConfig, analyticsConfig...) keep the initial related instance
    [
      this.mainForm.get(MAIN_FORM_KEYS.STARTING_CONFIG),
      this.mainForm.get(MAIN_FORM_KEYS.RESOURCES_CONFIG),
      this.mainForm.get(MAIN_FORM_KEYS.MAP_CONFIG),
      this.mainForm.get(MAIN_FORM_KEYS.TIMELINE_CONFIG),
      this.mainForm.get(MAIN_FORM_KEYS.SEARCH_CONFIG),
      this.mainForm.get(MAIN_FORM_KEYS.ANALYTICS_CONFIG),
      this.mainForm.get(MAIN_FORM_KEYS.SIDE_MODULES_CONFIG),
      this.mainForm.get(MAIN_FORM_KEYS.LOOK_AND_FEEL_CONFIG),
      this.mainForm.get(MAIN_FORM_KEYS.COMMON_CONFIG),
      this.mainForm.get(MAIN_FORM_KEYS.EXTERNAL_NODE_CONFIG),
      this.mainForm.get(MAIN_FORM_KEYS.RESULT_LIST_CONFIG)
    ].forEach((sf: FormGroup) => {
      Object.keys(sf.controls).forEach(c => sf.removeControl(c));
    });
  }

  public getMainCollection(): string {
    const collectionFormControl = this.startingConfig.getFg().customControls.collection;
    if (!!this.startingConfig.getFg() && !!collectionFormControl) {
      return collectionFormControl.value;
    }
    return '';
  }

}
