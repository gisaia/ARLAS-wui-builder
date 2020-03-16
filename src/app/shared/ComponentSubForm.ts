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
import { ControlValueAccessor, FormGroup, Validator, AbstractControl, ValidationErrors } from '@angular/forms';
import { OnDestroy, Input, OnInit } from '@angular/core';
import { Observable, Subscription, Subject } from 'rxjs';
import { NGXLogger } from 'ngx-logger';
import { getAllFormGroupErrors } from '@utils/tools';

/**
 * TO inherit from a component that manages a sub-form.
 * Implementing 'ControlValueAccessor', values are automatically set from the parent form.
 */
export abstract class ComponentSubForm implements ControlValueAccessor, Validator, OnInit, OnDestroy {

    public formFg: FormGroup;
    // be informed if the parent form is submitted
    @Input() public submit: Observable<void>;
    // notify the submission to an optional child component
    public submitSubject: Subject<void> = new Subject<void>();
    private submitSubscription: Subscription;

    constructor(
        protected logger: NGXLogger
    ) {
    }

    public ngOnInit() {
        this.submitSubscription = this.submit.subscribe(() => {
            this.onSubmit();
        });
    }

    protected onSubmit() {
        this.formFg.markAllAsTouched();
        this.submitSubject.next();
    }

    public onTouched: () => void = () => { };

    writeValue(obj: any): void {
        if (obj) {
            this.formFg.patchValue(obj, { emitEvent: false });
            this.onTouched();
        }
    }

    registerOnChange(fn: any): void {
        this.formFg.valueChanges.subscribe(fn);
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        isDisabled ? this.formFg.disable() : this.formFg.enable();
    }

    validate(control: AbstractControl): ValidationErrors {
        return this.formFg.valid ? null : {
            invalidForm:
            {
                valid: false,
                message: 'InnerForm fields are invalid',
                errors: getAllFormGroupErrors(this.formFg)
            }
        };
    }

    registerOnValidatorChange?(fn: () => void): void {
        this.formFg.valueChanges.subscribe(fn);
    }

    ngOnDestroy(): void {
        this.submitSubscription.unsubscribe();
    }

}
