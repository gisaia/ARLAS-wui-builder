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
import { FormGroup, AbstractControl, FormArray } from '@angular/forms';

enum MAIN_FORM_KEYS {
  MAP_CONFIG_LAYERS = 'MapConfigLayers',
  MAP_CONFIG_GLOBAL = 'MapConfigGlobal',
  STARTING_CONFIG = 'StartingConfig'
}

@Injectable({
  providedIn: 'root'
})
export class MainFormService {

  constructor() { }

  public mainForm = new FormGroup({});

  public getMapConfigLayersForm(): FormArray {
    return this.mainForm.get(MAIN_FORM_KEYS.MAP_CONFIG_LAYERS) as FormArray;
  }

  public addMapConfigLayersFormIfInexisting(fg: FormArray) {
    if (this.getMapConfigLayersForm() == null) {
      return this.mainForm.addControl(MAIN_FORM_KEYS.MAP_CONFIG_LAYERS, fg);
    }
  }

  public getMapConfigGlobalForm(): FormGroup {
    return this.mainForm.get(MAIN_FORM_KEYS.MAP_CONFIG_GLOBAL) as FormGroup;
  }

  public addMapConfigGlobalFormIfInexisting(fg: FormGroup) {
    if (this.getMapConfigGlobalForm() == null) {
      return this.mainForm.addControl(MAIN_FORM_KEYS.MAP_CONFIG_GLOBAL, fg);
    }
  }

  public initFormWithStartingConfig(fg: FormGroup) {
    this.mainForm.reset();
    this.mainForm.addControl(MAIN_FORM_KEYS.STARTING_CONFIG, fg);
  }

  public getStartingGlobalForm(): FormGroup {
    return this.mainForm.get(MAIN_FORM_KEYS.STARTING_CONFIG) as FormGroup;
  }

  public getCollections(): string[] {
    if (this.getStartingGlobalForm() !== null) {
      return this.getStartingGlobalForm().get('collections').value;
    }
    return [];
  }

}
