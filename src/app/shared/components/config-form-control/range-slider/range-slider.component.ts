import {Component, DestroyRef, effect, inject, input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSliderModule} from '@angular/material/slider';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {SliderRangeFormControl} from '@shared-models/config-form';
import {TranslatePipe} from '@ngx-translate/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatCard} from '@angular/material/card';
import {distinctUntilChanged} from 'rxjs';
import {marker} from '@colsen1991/ngx-translate-extract-marker';

// Error when min max range is not respected
const ERROR = {'notSameValue': {}};

@Component({
    selector: 'app-range-slider',
    standalone: true,
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
    public control = input.required<SliderRangeFormControl>();
    private readonly destroyRef = inject(DestroyRef);

    private get ctrl(): SliderRangeFormControl {
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
        return (c) => c.value <= this.ctrl.minFc.value ? null : ERROR;
    }

    public notSameValueValidatorMin() {
        return (c) => c.value >= this.ctrl.maxFc.value ? null : ERROR;
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

    private syncInternalControls(ctrl: SliderRangeFormControl) {
        ctrl.minFc.setValue(ctrl.value.min, {emitEvent: false});
        ctrl.maxFc.setValue(ctrl.value.max, {emitEvent: false});

        // Listen for changes to update main control.
        ctrl.minFc.valueChanges.pipe(
            distinctUntilChanged(),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(v => {
            ctrl.setValue({...ctrl.value, min: v}, {emitEvent: false});
            this.setErrors();
        });

        ctrl.maxFc.valueChanges.pipe(
            distinctUntilChanged(),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(v => {
            ctrl.setValue({...ctrl.value, max: v}, {emitEvent: false});
            this.setErrors();
        });

        ctrl.minFc.setValidators(this.notSameValueValidatorMin());
        ctrl.maxFc.setValidators(this.notSameValueValidatorMax());
    }
}
