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
import { AbstractControl, AbstractControlOptions, FormArray, FormBuilder, FormGroup, FormControl, ValidatorFn } from '@angular/forms';
import { DefaultValuesService } from '@services/default-values/default-values.service';

@Injectable({
  providedIn: 'root'
})
export class FormBuilderWithDefaultService {

  constructor(
    private defaultValuesService: DefaultValuesService,
    private formBuilder: FormBuilder) { }

  public group(
    defaultValueKey: string,
    controlsConfig: { [key: string]: any; },
    options?: AbstractControlOptions | { [key: string]: any; } | null): FormGroup {

    const builtGroup = this.formBuilder.group(controlsConfig, options);
    this.setDefaultValueRecursively(defaultValueKey, builtGroup);
    return builtGroup;
  }

  public control(
    defaultValueKey: string,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null
  ) {
    const buildControl = this.formBuilder.control('', validatorOrOpts);
    buildControl.setValue(this.defaultValuesService.getValue(defaultValueKey));
    return buildControl;
  }

  private setDefaultValueRecursively(path: string, control: AbstractControl) {

    if (control instanceof FormGroup || control instanceof FormArray) {
      Object.keys(control.controls).forEach(c => {
        this.setDefaultValueRecursively(path + '.' + c, control.controls[c]);
      });
    } else {
      const defaultValue = this.defaultValuesService.getValue(path);
      if (!!defaultValue) {
        control.setValue(defaultValue);
      }
    }
  }

}
