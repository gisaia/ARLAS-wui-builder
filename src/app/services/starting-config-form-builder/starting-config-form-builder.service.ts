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
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DefaultValuesService } from '@services/default-values/default-values.service';

export class StartingConfigFormGroup extends FormGroup {
  constructor() {
    super({
      serverUrl: new FormControl(null,
        [
          Validators.required,
          Validators.pattern(
            '(https?://)?(([0-9.]{1,4}){4}(:[0-9]{2,5})|([a-z0-9-.]+)(\\.[a-z-.]+)(:[0-9]{2,5})?|localhost(:[0-9]{2,5}))+([/?].*)?'
          )
        ]),

      collections: new FormControl(null, [Validators.required, Validators.maxLength(1)]),
      unmanagedFields: new FormGroup({
        maxAgeCache: new FormControl(),
        appName: new FormControl(),
        appUnit: new FormControl(),
        appNameBackgroundColor: new FormControl()
      })
    });
  }

  public customControls = {
    serverUrl: this.get('serverUrl'),
    collections: this.get('collections'),
    unmanagedFields: {
      maxAgeCache: this.get('unmanagedFields.maxAgeCache'),
      appName: this.get('unmanagedFields.appName'),
      appUnit: this.get('unmanagedFields.appUnit'),
      appNameBackgroundColor: this.get('unmanagedFields.appNameBackgroundColor'),
    },
  };

}

@Injectable({
  providedIn: 'root'
})
export class StartingConfigFormBuilderService {

  constructor(
    private defaultValuesService: DefaultValuesService,
  ) { }

  public build() {
    const formGroup = new StartingConfigFormGroup();
    this.defaultValuesService.setDefaultValueRecursively('global', formGroup);
    return formGroup;
  }
}
