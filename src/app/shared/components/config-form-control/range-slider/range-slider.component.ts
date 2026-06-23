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
import {Component, DestroyRef, effect, inject, input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSliderModule} from '@angular/material/slider';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {RangeSliderFormControl} from '@shared-models/config-form';
import {TranslatePipe} from '@ngx-translate/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatCard} from '@angular/material/card';
import {distinctUntilChanged} from 'rxjs';
import {marker} from '@colsen1991/ngx-translate-extract-marker';

// Error when min max range is not respected
const ERROR = {'notSameValue': {}};
const DEFAULT_MIN = 0;
const DEFAULT_MAX = 1;

@Component({
    selector: 'app-range-slider',
    imports: [
        CommonModule,
        FormsModule,
        MatSliderModule,
        MatInputModule,
        MatFormFieldModule,
        TranslatePipe,
        ReactiveFormsModule,
        MatCard,
    ],
    templateUrl: './range-slider.component.html',
    styleUrls: ['./range-slider.component.scss'],
})
export class RangeSliderComponent {
    public control = input.required<RangeSliderFormControl>();
    private readonly destroyRef = inject(DestroyRef);

    private get ctrl(): RangeSliderFormControl {
        const c = this.control();
        if (!c) {
            throw new Error(marker('RangeSliderComponent: control input is required'));
        }
        return c;
    }


    public constructor() {
        effect(() => this.syncInternalControls(this.ctrl));
    }

    /** Update main validator fc **/
    public setErrors() {
        if (this.ctrl.minFc.invalid || this.ctrl.maxFc.invalid) {
            this.ctrl.setErrors(ERROR);
        } else {
            this.ctrl.setErrors(null);
        }
    }

    public notSameValueValidatorMax() {
        return (c) => c.value <= this.ctrl.minFc.value ? ERROR : null;
    }

    public notSameValueValidatorMin() {
        return (c) => c.value >= this.ctrl.maxFc.value ? ERROR :null ;
    }

    /** Called when the slider's MIN thumb changes */
    public onSliderMinChange(value: number | null): void {
        if (value === null) {
            return;
        }
        this.ctrl.minFc.setValue(value);
    }

    /** Called when the slider's MAX thumb changes */
    public onSliderMaxChange(value: number | null): void {
        if (value === null) {
            return;
        }
        this.ctrl.maxFc.setValue(value);
    }

    private syncInternalControls(ctrl: RangeSliderFormControl) {
        ctrl.minFc.setValue(this.initMin(ctrl) ?? DEFAULT_MIN, {emitEvent: false});
        ctrl.maxFc.setValue(this.initMax(ctrl) ?? DEFAULT_MAX, {emitEvent: false});
        // Listen for changes to update main control.
        ctrl.minFc.valueChanges.pipe(
            distinctUntilChanged(),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(v => {
            ctrl.setValue({...ctrl.value, min: v}, {emitEvent: false});
            ctrl.maxFc.updateValueAndValidity({ emitEvent: false });
            this.setErrors();
        });

        ctrl.maxFc.valueChanges.pipe(
            distinctUntilChanged(),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(v => {
            ctrl.setValue({...ctrl.value, max: v}, {emitEvent: false});
            ctrl.minFc.updateValueAndValidity({ emitEvent: false });
            this.setErrors();
        });

        ctrl.minFc.setValidators(this.notSameValueValidatorMin());
        ctrl.maxFc.setValidators(this.notSameValueValidatorMax());
    }

    private initMin(ctrl: RangeSliderFormControl){
       return  Math.max(ctrl.value.min, ctrl.min);
    }

    private initMax(ctrl: RangeSliderFormControl){
        return  Math.min(ctrl.value.max, ctrl.max);
    }
}
