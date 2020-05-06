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
import { FormGroup, ValidatorFn, AbstractControlOptions, AsyncValidatorFn, FormControl, AbstractControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { HistogramUtils } from 'arlas-d3';

/**
 * These are wrappers above existing FormGroup and FormControl in order to add a custom behavior.
 * The goal is to have a full model-driven form without putting (or duplicating) the logic
 * into the view or into the ngOnInit.
 * Looking for one control, everything should be described into its declaration.
 */

export interface SelectOption {
    value: any;
    label: any;
}

interface ControlOptionalParams {

    // if false, it is a required control
    optional?: boolean;

    // getter the other controls that it depends on
    dependsOn?: () => Array<ConfigFormControl>;

    // callback to be executed when a dependency changes
    onDependencyChange?: (c: ConfigFormControl) => void;

    // indicates if other fields that depends on this one, should be reset when this one changes
    resetDependantsOnChange?: boolean;

    // usual validators
    validators?: ValidatorFn[];

    // getter of child components
    childs?: () => Array<ConfigFormControl>;

    // is the description in regular HTML. In this case, the caller
    // is responsable of translating its content
    isDescriptionHtml?: boolean;
}

interface GroupOptionalParams {
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null;
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null;
}

export class ConfigFormGroup extends FormGroup {

    public title: string;

    constructor(
        controls: {
            [key: string]: ConfigFormControl | ConfigFormGroup;
        },
        private optionalParams: GroupOptionalParams = {}) {

        super(controls, optionalParams.validatorOrOpts, optionalParams.asyncValidator);
    }

    get controlsValues() {
        return Object.values(this.controls) as Array<ConfigFormControl>;
    }

    public withTitle(title: string) {
        this.title = title;
        return this;
    }
}

export abstract class ConfigFormControl extends FormControl {

    // reference to other controls that depends on this one
    public dependantControls: Array<AbstractControl>;

    // if it is a child control, it is to be displayed below another controls into a single config element
    public isChild = false;

    constructor(
        formState: any,
        public label: string,
        public description: string,
        private optionalParams: ControlOptionalParams = {}) {

        super(formState);
        // add default values to missing attributes
        this.optionalParams = {
            ...{
                optional: false,
                validators: [],
                dependsOn: () => [],
                onDependencyChange: () => null,
                childs: () => [],
                isDescriptionHtml: false
            },
            ...this.optionalParams
        };
        this.initValidators();
    }

    get optional() { return this.optionalParams.optional; }
    get dependsOn() { return this.optionalParams.dependsOn; }
    get onDependencyChange() { return this.optionalParams.onDependencyChange; }
    get childs() { return this.optionalParams.childs; }
    get isDescriptionHtml() { return this.optionalParams.isDescriptionHtml; }
    get resetDependantsOnChange() { return this.optionalParams.resetDependantsOnChange || false; }

    public initValidators() {
        const optionalValidator = this.optionalParams.optional ? [] : [Validators.required];
        this.setValidators(optionalValidator.concat(this.optionalParams.validators));
    }
}

export class SlideToggleFormControl extends ConfigFormControl {
    constructor(
        formState: any,
        label: string,
        description: string,
        public labelAfter?: string,
        optionalParams?: ControlOptionalParams
    ) {

        super(formState, label, description, { ...optionalParams, ... { optional: true } });
    }
}

export class SelectFormControl extends ConfigFormControl {

    // used only for autocomplete: list of filtered options
    public filteredOptions: Array<SelectOption>;
    public syncOptions: Array<SelectOption> = [];

    constructor(
        formState: any,
        label: string,
        description: string,
        public isAutocomplete: boolean,
        private options: Array<SelectOption> | Observable<Array<SelectOption>>,
        optionalParams?: ControlOptionalParams) {

        super(
            formState,
            label,
            description,
            optionalParams);

        if (options instanceof Observable) {
            options.subscribe(opts => this.setSyncOptions(opts));
        } else if (options instanceof Array) {
            this.setSyncOptions(options);
        }

        if (isAutocomplete) {
            // TODO should we unsubscribe later?
            this.valueChanges.subscribe(v =>
                this.filteredOptions = this.syncOptions.filter(o => o.label.indexOf(v) >= 0)
            );
        }

    }

    public setSyncOptions(newOptions: Array<SelectOption>) {
        this.syncOptions = newOptions;
        this.filteredOptions = newOptions;
    }
}

export class HuePaletteFormControl extends SelectFormControl {
    constructor(
        formState: any,
        label: string,
        description: string,
        private hueOptions: Array<[number, number] | string>,
        optionalParams?: ControlOptionalParams) {
        super(
            formState,
            label,
            description,
            false,
            HuePaletteFormControl.toHslOptions(hueOptions),
            optionalParams);
    }

    public static toHslOptions(hues: Array<[number, number] | string>): Array<SelectOption> {
        return hues.map(h => {
            return {
                value: h,
                label: HistogramUtils.getColor(0, h).toHslString() + ', ' + HistogramUtils.getColor(1, h).toHslString()
            };
        });
    }

    public getCurrentOption() {
        // JSON.stringifY to compare also array (as `[] === []` => false)
        return this.syncOptions.find(o => JSON.stringify(o.value) === JSON.stringify(this.value));
    }

}

export class HiddenFormControl extends ConfigFormControl {
    constructor(
        formState: any,
        optionalParams?: ControlOptionalParams
    ) {
        super(formState, null, null, optionalParams);
    }
}

export class SliderFormControl extends ConfigFormControl {
    constructor(
        formState: any,
        label: string,
        description: string,
        public min: number,
        public max: number,
        public step: number,
        optionalParams?: ControlOptionalParams) {

        super(formState, label, description, optionalParams);
    }
}

export class InputFormControl extends ConfigFormControl {
    constructor(
        formState: any,
        label: string,
        description: string,
        public inputType: string = 'text',
        optionalParams?: ControlOptionalParams) {

        super(formState, label, description, optionalParams);
    }
}

export class IconFormControl extends ConfigFormControl {
}

export class ColorFormControl extends ConfigFormControl {
}
