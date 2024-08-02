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
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { HiddenFormControl } from '@shared-models/config-form';

export class ResourcesConfigFormGroup extends FormGroup {
  public constructor() {
    super({
      resources: new FormGroup({
        previewId: new HiddenFormControl(''),
        previewValue: new HiddenFormControl('')
      })
    });
  }

  public customControls = {
    resources: {
      previewId: this.get('resources.previewId'),
      previewValue: this.get('resources.previewValue'),
    }
  };

  public hasPreviewId() {
    return !!this.customControls.resources.previewId.value;
  }

  public hasPreviewImage() {
    return !!this.customControls.resources.previewValue.value;
  }

}

@Injectable({
  providedIn: 'root'
})
export class ResourcesConfigFormBuilderService {

  public constructor(
    private defaultValuesService: DefaultValuesService,
  ) { }

  public build() {
    const formGroup = new ResourcesConfigFormGroup();
    this.defaultValuesService.setDefaultValueRecursively('global', formGroup);
    formGroup.disable();
    return formGroup;
  }
}
