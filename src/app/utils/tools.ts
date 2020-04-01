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

import { AbstractControl, FormArray, FormGroup, FormControl } from '@angular/forms';

/**
 * Get object or String value of an object from key
 */
export function getObject(datalayer: any, objectKey: string) {
    // if datalayer doesn't exists, just return
    if (!datalayer) {
        return null;
    }
    // default return datalayer
    let current = datalayer;
    // check every layer
    if (typeof objectKey === 'string') {
        const numberOfObjectHierarchy = objectKey.match(/\./g).length;
        for (let i = 1; i <= numberOfObjectHierarchy; i++) {
            const currentKey = objectKey.split(/\./)[i];
            if (typeof current[currentKey] === 'undefined') {
                return null;
            }
            current = current[currentKey];
        }
    }
    return current;
}

// recursively update the value and validity of itself and sub-controls (but not ancestors)
export function updateValueAndValidity(control: AbstractControl, onlySelf: boolean = true, emitEvent: boolean = true) {
    control.updateValueAndValidity({ onlySelf, emitEvent });
    if (control instanceof FormGroup || control instanceof FormArray) {
        Object.keys(control.controls).forEach(key => {
            updateValueAndValidity(control.get(key), onlySelf, emitEvent);
        });
    }
}

export function getNbErrorsInControl(control: AbstractControl): number {
    let nbErrors = 0;
    nbErrors += !!control.errors ? Object.keys(control.errors).length : 0;
    if (control instanceof FormGroup || control instanceof FormArray) {
        Object.keys(control.controls).forEach(k => {
            nbErrors += getNbErrorsInControl(control.controls[k]);
        });
    }
    return nbErrors;
}

export function getAllFormGroupErrors(control: FormGroup | FormArray) {
    const errors = {};
    Object.keys(control.controls)
        .filter(k => !control.get(k).valid)
        .forEach(k => {
            const subControl = control.get(k);
            if (subControl instanceof FormGroup || subControl instanceof FormArray) {
                errors[k] = getAllFormGroupErrors(subControl);
            } else {
                errors[k] = subControl.errors;
            }
        });
    return errors;
}

export function ensureMinLessThanMax(
    newValue: number,
    minControl: AbstractControl,
    maxControl: AbstractControl,
    isMinOrMax: 'min' | 'max') {

    if (isMinOrMax === 'min') {
        if (newValue > maxControl.value) {
            maxControl.setValue(newValue);
        }
    } else if (newValue < minControl.value) {
        minControl.setValue(newValue);
    }
}

export function moveInFormArray(previousIndex: number, newIndex: number, fa: FormArray) {
    if (previousIndex === newIndex) {
        return;
    }

    const previousTab = fa.at(previousIndex);

    if (previousIndex < newIndex) {
        fa.insert(newIndex + 1, previousTab);
        fa.removeAt(previousIndex);
    } else {
        fa.insert(newIndex, previousTab);
        fa.removeAt(previousIndex + 1);
    }
}
