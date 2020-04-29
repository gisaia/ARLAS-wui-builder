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
import { MainFormService } from '@services/main-form/main-form.service';
import { MapGlobalFormBuilderService } from '../map-global-form-builder/map-global-form-builder.service';
import { FormArray, Validators, FormControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class MapInitService {

  constructor(
    private mainFormService: MainFormService,
    private mapGlobalFormBuilder: MapGlobalFormBuilderService
  ) { }

  public initModule() {
    this.mainFormService.mapConfig.initGlobalFg(
      this.mapGlobalFormBuilder.build()
    );

    this.mainFormService.mapConfig.initLayersFa(
      new FormArray([], [Validators.required])
    );
  }

  public createRequestGeometry(collection: string, geometry_path: string, id_path: string) {
    return new FormGroup({
      collection: new FormControl({ value: collection, disabled: true }),
      requestGeom: new FormControl(geometry_path, Validators.required),
      idFeatureField: new FormControl(id_path, Validators.required),
    })
  }

}
