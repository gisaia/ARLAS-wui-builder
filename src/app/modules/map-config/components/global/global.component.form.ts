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
import { FormGroup, FormArray, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MainFormService } from '@services/main-form/main-form.service';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';

export class GlobalComponentForm {

    public globalFg: FormGroup;

    constructor(
        protected mainFormService: MainFormService,
        protected formBuilderDefault: FormBuilderWithDefaultService
    ) {
        this.mainFormService.mapConfig.initGlobalFg(
            this.formBuilderDefault.group('map.global', {
                requestGeometries: new FormArray([]),
                geographicalOperator: new FormControl(null, Validators.required)
            }));
        this.globalFg = this.mainFormService.mapConfig.getGlobalFg();
    }

    get requestGeometries() {
        return this.globalFg.get('requestGeometries') as FormArray;
    }

}
