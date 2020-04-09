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
import { Observable, Subscription, Subject, BehaviorSubject } from 'rxjs';
import { NGXLogger } from 'ngx-logger';
import { getAllFormGroupErrors } from '@utils/tools';

/**
 * To inherit from a component that manages a sub-form.
 * Implementing 'ControlValueAccessor', values are automatically set from the parent form.
 */
export abstract class ComponentSubForm implements ControlValueAccessor, Validator, OnInit, OnDestroy {

    public formFg: FormGroup;
    // be informed if the parent form is submitted
    @Input() public submit: Observable<boolean>;
    // notify the submission to an optional child component
    public submitSubject = new BehaviorSubject<boolean>(false);
    private submitSubscription: Subscription;

    constructor(
        protected logger: NGXLogger
    ) {
    }

    public ngOnInit() {
        this.submitSubscription = this.submit.subscribe((b) => {
            if (b) {
                this.onSubmit();
            }
        });
    }

    protected onSubmit() {
        this.formFg.markAllAsTouched();
        this.submitSubject.next(true);
    }

    public onTouched: () => void = () => { };

    public writeValue(obj: any): void {
        if (obj) {
            this.formFg.patchValue(obj, { emitEvent: false });
            this.onTouched();
        }
    }

    public registerOnChange(fn: any): void {
        this.formFg.valueChanges.subscribe(fn);
    }

    public registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    public setDisabledState?(isDisabled: boolean): void {
        isDisabled ? this.formFg.disable() : this.formFg.enable();
    }

    public validate(control: AbstractControl): ValidationErrors {
        return this.formFg.valid ? null : getAllFormGroupErrors(this.formFg);
    }

    public registerOnValidatorChange?(fn: () => void): void {
        this.formFg.valueChanges.subscribe(fn);
    }

    public ngOnDestroy(): void {
        // sometimes null, but no idea why...
        [this.submitSubscription, this.submitSubject]
            .filter(s => !!s)
            .forEach(s => s.unsubscribe());
    }

}
