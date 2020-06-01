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

export const LOCALSTORAGE_CONFIG_ID_KEY = 'current_config_id';

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

/**
 * Check that all sub-controls of a control have been touched.
 * This is the case when we try to export => material touches all controls,
 * so it can be detected to detect an export and display remaining errors.
 */
export function isFullyTouched(control: AbstractControl): boolean {

    if (control instanceof FormControl) {
        return control.touched;
    } else if (control.touched && (control instanceof FormGroup || control instanceof FormArray)) {
        if (control.controls.length === 0) {
            return control.touched;
        } else if (control.controls.length === 1) {
            return Object.values(control.controls)[0].touched;
        } else {
            return Object.values(control.controls).map(c => isFullyTouched(c)).reduce((b1, b2) => b1 && b2);
        }
    }
    return false;
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

export function valuesToOptions(values: Array<string>) {
    return values.map(v => ({
        label: v.charAt(0).toUpperCase() + v.slice(1),
        value: v
    }));
}

export function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
        if (+match === 0) {
            return '';
        }
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
}

