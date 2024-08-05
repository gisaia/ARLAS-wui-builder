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
import { AbstractControl, Validators, ValidatorFn } from '@angular/forms';

export const urlRegexp = '(https?://)?(([0-9.]{1,4}){4}(:[0-9]{2,5})|([a-z0-9-.]+)' +
  '(\\.[a-z-.]+)(:[0-9]{2,5})?|localhost(:[0-9]{2,5}))+([/?].*)?';

/**
 * Check that a control's value is an integer
 */
export function integerValidator(control: AbstractControl) {
  const value = control.value;
  if ((parseFloat(value) === parseInt(value, 10)) && !isNaN(value)) {
    return null;
  } else {
    return {
      notNumeric: true
    };
  }
}

export const urlValidator = Validators.pattern(urlRegexp);
