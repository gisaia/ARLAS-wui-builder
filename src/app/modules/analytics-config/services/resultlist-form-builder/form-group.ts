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

import { FormArray, FormGroup, Validators } from '@angular/forms';
import { marker } from '@colsen1991/ngx-translate-extract-marker';
import {
  ConfigFormGroup,
  HiddenFormControl, InputFormControl, SelectFormControl, SelectOption, SliderFormControl, TextareaFormControl
} from '@shared-models/config-form';
import { Observable } from 'rxjs';

export type ResultlistDataConfigForm = FormGroup<{
  collection: SelectFormControl;
  searchSize: SliderFormControl;
  columns: FormArray;
  grid: ConfigFormGroup;
  detailsTitle: HiddenFormControl;
  details: FormArray;
  idFieldName: HiddenFormControl;
}>;

export class ResultlistDetailFormGroup extends FormGroup {

  public constructor() {
    super({
      name: new InputFormControl(
        '',
        marker('Section'),
        ''
      ),
      fields: new FormArray([], Validators.required)
    });
  }

  public customControls = {
    name: this.get('name') as InputFormControl,
    fields: this.get('fields') as FormArray<ResultlistDetailFieldFormGroup>,
  };
}

export class ResultlistDetailFieldFormGroup extends FormGroup {

  public constructor(fieldsObs: Observable<Array<SelectOption>>) {
    super({
      label: new InputFormControl(
        '',
        marker('Detail label'),
        ''
      ),
      path: new SelectFormControl(
        '',
        marker('Detail field'),
        '',
        true,
        fieldsObs
      ),
      process: new TextareaFormControl(
        '',
        marker('Apply a calculation in javascript'),
        '',
        marker('e.g : result+\'$\''),
        1,
        {
          optional: true,
          validators: [TextareaFormControl.processValidator('result')],
        }
      )
    });
  }

  public customControls = {
    label: this.get('label') as InputFormControl,
    path: this.get('path') as SelectFormControl,
    process: this.get('process') as TextareaFormControl,
  };
}
