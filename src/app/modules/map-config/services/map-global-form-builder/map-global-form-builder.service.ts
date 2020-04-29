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
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';

export class MapGlobalFormGroup extends FormGroup {

  constructor() {
    super({
      requestGeometries: new FormArray([]),
      geographicalOperator: new FormControl(null, Validators.required),
      allowMapExtend: new FormControl(),
      margePanForLoad: new FormControl(null, Validators.min(0)),
      margePanForTest: new FormControl(null, Validators.min(0)),
      initZoom: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(18)]),
      initCenterLat: new FormControl(null, Validators.required),
      initCenterLon: new FormControl(null, Validators.required),
      displayScale: new FormControl()
    });
  }

  public customControls = {
    requestGeometries: this.get('requestGeometries') as FormArray,
    geographicalOperator: this.get('geographicalOperator') as FormControl,
    allowMapExtend: this.get('allowMapExtend') as FormControl,
    margePanForLoad: this.get('margePanForLoad') as FormControl,
    margePanForTest: this.get('margePanForTest') as FormControl,
    initZoom: this.get('initZoom') as FormControl,
    initCenterLat: this.get('initCenterLat') as FormControl,
    initCenterLon: this.get('initCenterLon') as FormControl,
    displayScale: this.get('displayScale') as FormControl
  };
}

@Injectable({
  providedIn: 'root'
})
export class MapGlobalFormBuilderService {

  constructor(
    protected formBuilderDefault: FormBuilderWithDefaultService
  ) { }

  public build() {
    const mapGlobalFormGroup = new MapGlobalFormGroup();
    this.formBuilderDefault.setDefaultValueRecursively('map.global', mapGlobalFormGroup);
    return mapGlobalFormGroup;
  }

}