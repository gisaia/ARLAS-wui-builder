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
import { ValidatorFn, ValidationErrors, FormGroup, AbstractControl, Validators } from '@angular/forms';

export class CustomValidators {

    static getLTEValidator(minField: string, maxField: string): ValidatorFn {
        return (fg: FormGroup): ValidationErrors | null => {
            const start = fg.get(minField).value;
            const end = fg.get(maxField).value;
            return start !== null && end !== null && start <= end ? null : { lte: true };
        };
    }

    static getConditionalValidator(predicate: () => boolean, validator: ValidatorFn) {
        return ((formControl: AbstractControl) => {
            if (predicate()) {
                return validator(formControl);
            }
            return null;
        });
    }
}
