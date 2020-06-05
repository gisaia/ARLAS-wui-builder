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
import {
    FormGroup, ValidatorFn, AbstractControlOptions, AsyncValidatorFn, FormControl, AbstractControl, Validators, FormArray
} from '@angular/forms';
import { Observable } from 'rxjs';
import { HistogramUtils } from 'arlas-d3';
import { CollectionField } from '@services/collection-service/models';
import { METRIC_TYPES } from '@services/collection-service/collection.service';
import { toKeywordOptionsObs, toNumericOrDateOptionsObs } from '@services/collection-service/tools';
import { ProportionedValues } from '@shared-services/property-selector-form-builder/models';

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

export abstract class ConfigFormControl extends FormControl {

    // reference to other controls that depends on this one
    public dependantControls: Array<AbstractControl>;

    // if it is a child control, it is to be displayed below another controls into a single config element
    public isChild = false;
    // an initial value is used by app-reset-on-change, when resetting a form control (instead of a "default.json" value)
    public initialValue: any;

    constructor(
        formState: any,
        public label: string,
        public description: string,
        private optionalParams: ControlOptionalParams = {}) {

        super(formState);
        this.initialValue = formState;
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
    get title() { return this.optionalParams.title; }

    public initValidators() {
        const optionalValidator = this.optionalParams.optional ? [] : [Validators.required];
        this.setValidators(optionalValidator.concat(this.optionalParams.validators));
    }

    public enableIf(condition: boolean) {
        // prevent a single control to get enabled whereas the parent is disabled
        // => this would enable the parent again
        if (condition && this.parent.status !== 'DISABLED') {
            this.enable();
        } else {
            this.disable({ emitEvent: false });
        }
    }

}

interface ControlOptionalParams {

    // if false, it is a required control
    optional?: boolean;

    // getter the other controls that it depends on
    dependsOn?: () => Array<ConfigFormControl | ConfigFormGroup>;

    // callback to be executed when a dependency changes
    // it is also executed at loading, so it may be used without any 'dependsOn' to be executed only once
    onDependencyChange?: (c: ConfigFormControl | ConfigFormGroup) => void;

    // indicates if other fields that depends on this one, should be reset when this one changes
    resetDependantsOnChange?: boolean;

    // usual validators
    validators?: ValidatorFn[];

    // getter of child components
    childs?: () => Array<ConfigFormControl>;

    // is the description in regular HTML. In this case, the caller
    // is responsable of translating its content
    isDescriptionHtml?: boolean;

    // a title that is displayed before the field.
    // TODO remove the title from ConfigFormGroup and move it to fields
    title?: string;
}

interface GroupOptionalParams {
    // getter the other controls that it depends on
    dependsOn?: () => Array<ConfigFormControl>;

    // callback to be executed when a dependency changes
    onDependencyChange?: (c: ConfigFormControl | ConfigFormGroup) => void;

    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null;
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null;
}

export class ConfigFormGroup extends FormGroup {

    // reference to other controls that depends on this one
    public dependantControls: Array<AbstractControl>;

    public title: string;
    public stepName: string;
    public tabName: string;

    constructor(
        controls: {
            [key: string]: AbstractControl;
        },
        private optionalParams: GroupOptionalParams = {}) {

        super(controls, optionalParams.validatorOrOpts, optionalParams.asyncValidator);
    }

    get dependsOn() { return this.optionalParams.dependsOn; }
    get onDependencyChange() { return this.optionalParams.onDependencyChange; }

    get controlsRecursively() {
        return this.getControls(this);
    }

    private getControls(control: FormGroup | FormArray): Array<AbstractControl> {
        return Object.values(control.controls).flatMap(c => {
            if (c instanceof FormControl) {
                return [c];
            } else if (c instanceof FormGroup || c instanceof FormArray) {
                return [
                    c,
                    ...this.getControls(c)
                ];
            } else {
                return [];
            }
        });
    }

    public get configFormControls(): Array<ConfigFormControl> {
        return Object.values(this.controls).filter(c => c instanceof ConfigFormControl) as Array<ConfigFormControl>;
    }

    public withTitle(title: string) {
        this.title = title;
        return this;
    }

    public withStepName(stepName: string) {
        this.stepName = stepName;
        return this;
    }

    public withTabName(tabName: string) {
        this.tabName = tabName;
        return this;
    }

    public withDependsOn(dependsOn: () => Array<ConfigFormControl>) {
        this.optionalParams.dependsOn = dependsOn;
        return this;
    }
    public withOnDependencyChange(onDependencyChange: (c: ConfigFormControl | ConfigFormGroup) => void) {
        this.optionalParams.onDependencyChange = onDependencyChange;
        return this;
    }

    public enableIf(condition: boolean) {
        if (condition) {
            this.enable();
        } else {
            // emitEvent: false avoid the cascading effect. When enabling, it is expected to propagate
            // the status update so that dependan fields can update themselves. Whereas when disabling
            // we just want to disable everything. moreover, without it, some sub-fields may still be
            // enabled, probably because of the cascading update
            this.disable({ emitEvent: false });
        }
    }
}

// Represent an FormArray of FormGroup, i.a. a repeated FormGroup.
// Can be used to handle some fields by collection for example.
export class ConfigFormGroupArray extends FormArray {

    constructor(controls: ConfigFormGroup[]) {
        super(controls);
    }
}

export class SlideToggleFormControl extends ConfigFormControl {
    constructor(
        formState: any,
        label: string,
        description: string,
        optionalParams?: ControlOptionalParams
    ) {

        super(formState, label, description, { ...optionalParams, ... { optional: true } });
    }
}


export class ButtonToggleFormControl extends ConfigFormControl {
    constructor(
        formState: any,
        public options: Array<{ label: string, value: any }>,
        description: string,
        optionalParams?: ControlOptionalParams
    ) {

        super(formState, null, description, optionalParams);
    }
}

export class ComponentFormControl extends ConfigFormControl {
    constructor(
        public component: any,
        // inputs of the component, to be returned from the callback
        public inputs: {
            [key: string]: () => any;
        }
    ) {
        super(null, null, null, { optional: true });
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
        options: Array<SelectOption> | Observable<Array<SelectOption>>,
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
            this.valueChanges.subscribe(v => {
                if (!!v) {
                    this.filteredOptions = this.syncOptions.filter(o => o.label.indexOf(v) >= 0);
                } else {
                    this.filteredOptions = this.syncOptions;
                }

            }
            );
        }

    }

    public setSyncOptions(newOptions: Array<SelectOption>) {
        this.syncOptions = newOptions;
        this.filteredOptions = newOptions;
    }
}

export class OrderedSelectFormControl extends SelectFormControl {
    public sortDirection: string;
    public sorts: Set<string> = new Set();

    public addSort(sort: string, event) {
        event.stopPropagation();
        this.sorts.add(sort);
        this.setSortValue();
    }

    public removeSort(sort: string) {
        this.sorts.delete(sort);
        this.setSortValue();
    }

    private setSortValue() {
        const sortValue = Array.from(this.sorts).reduce((a, b) => a + ',' + b);
        this.setValue(sortValue);
    }

}

export class MetricWithFieldListFormControl extends ConfigFormControl {

    public METRICS = [
        METRIC_TYPES.AVG, METRIC_TYPES.SUM, METRIC_TYPES.MIN, METRIC_TYPES.MAX, METRIC_TYPES.CARDINALITY
    ];
    // TODO do not use validators, the fields look like in error
    public metricCtrl = new FormControl('', Validators.required);
    public fieldCtrl = new FormControl('', [
        Validators.required,
        (c) => !!this.autocompleteFilteredFields && this.autocompleteFilteredFields.map(f => f.value).indexOf(c.value) >= 0 ?
            null : { validateField: { valid: false } }
    ]);
    public metricFields: Array<SelectOption>;
    public autocompleteFilteredFields: Array<SelectOption>;

    constructor(
        formState: any,
        label: string,
        description: string,
        private collectionFields: Observable<Array<CollectionField>>,
        optionalParams?: ControlOptionalParams
    ) {
        super(formState, label, description, optionalParams);
        if (!this.optional) {
            // as the value is a set, if the control is required, an empty set should also be an error
            this.setValidators([
                (control) => !!control.value && Array.from(control.value).length > 0 ? null : { required: { valid: false } }
            ]);
        }
        this.metricCtrl.valueChanges.subscribe(v => {
            this.updateFieldsByMetric();
            this.fieldCtrl.reset();
        });
        this.fieldCtrl.valueChanges.subscribe(v => this.filterAutocomplete(v));
        this.filterAutocomplete();
        this.updateFieldsByMetric();
        this.setValue(new Set());
    }

    public updateFieldsByMetric() {
        const fieldObs = this.metricCtrl.value === METRIC_TYPES.CARDINALITY ?
            toKeywordOptionsObs(this.collectionFields) : toNumericOrDateOptionsObs(this.collectionFields);
        fieldObs.subscribe(f => {
            this.metricFields = f;
            this.filterAutocomplete();
        });
    }

    public filterAutocomplete(value?: string) {
        if (!!value) {
            this.autocompleteFilteredFields = this.metricFields.filter(o => o.label.indexOf(value) >= 0);
        } else {
            this.autocompleteFilteredFields = this.metricFields;
        }
    }

    public addMetric() {
        this.getValueAsSet().add({ field: this.fieldCtrl.value, metric: String(this.metricCtrl.value).toLowerCase() });
        this.updateValueAndValidity();
        this.fieldCtrl.reset();
    }

    public removeMetric(metric: { metric: string, field: string }) {
        this.getValueAsSet().delete(metric);
        this.updateValueAndValidity();
    }

    public getValueAsSet = () => (this.value as Set<{ metric: string, field: string }>);
}

// try to put in common with MetricWithFieldListFormControl
export class FieldWithSizeListFormControl extends ConfigFormControl {

    // TODO do not use validators, the fields look like in error
    public sizeCtrl = new FormControl('', Validators.required);
    public fieldCtrl = new FormControl('', [
        Validators.required,
        (c) => !!this.autocompleteFilteredFields && this.autocompleteFilteredFields.map(f => f.value).indexOf(c.value) >= 0 ?
            null : { validateField: { valid: false } }
    ]);
    public fields: Array<SelectOption>;
    public autocompleteFilteredFields: Array<SelectOption>;

    constructor(
        formState: any,
        label: string,
        description: string,
        collectionFields: Observable<Array<CollectionField>>,
        optionalParams?: ControlOptionalParams
    ) {
        super(formState, label, description, optionalParams);
        toKeywordOptionsObs(collectionFields).subscribe(fields => {
            this.fields = fields;
            this.filterAutocomplete();
        });
        this.fieldCtrl.valueChanges.subscribe(v => this.filterAutocomplete(v));
        this.setValue(new Set());
        if (!this.optional) {
            // as the value is a set, if the control is required, an empty set should also be an error
            this.setValidators([
                (control) => !!control.value && Array.from(control.value).length > 0 ? null : { required: { valid: false } }
            ]);
        }
    }

    public filterAutocomplete(value?: string) {
        if (!!value) {
            this.autocompleteFilteredFields = this.fields.filter(o => o.label.indexOf(value) >= 0);
        } else {
            this.autocompleteFilteredFields = this.fields;
        }
    }

    public add() {
        this.getValueAsSet().add({ field: this.fieldCtrl.value, size: parseInt(this.sizeCtrl.value, 10) });
        this.updateValueAndValidity();
        this.fieldCtrl.reset();
    }

    public remove(opt: { field: string, size: number }) {
        this.getValueAsSet().delete(opt);
        this.updateValueAndValidity();
    }

    public getValueAsSet = () => (this.value as Set<{ field: string, size: number }>);
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
        // label can be used to display an error with this label, if it is not valid
        label?: string,
        optionalParams?: ControlOptionalParams
    ) {
        super(formState, label, null, optionalParams);
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
        public ensureLessThan?: () => ConfigFormControl,
        public ensureGeaterThan?: () => ConfigFormControl,
        optionalParams?: ControlOptionalParams) {

        super(formState, label, description, optionalParams);
    }

    public checkLessThan(newValue: number) {
        const other = this.ensureLessThan();
        if (newValue > other.value) {
            other.setValue(newValue);
        }
    }

    public checkGreaterThan(newValue: number) {
        const other = this.ensureGeaterThan();
        if (newValue < other.value) {
            other.setValue(newValue);
        }
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

/**
 * Display a preview of color(s).
 * Expects as value:
 * - an Array<ProportionedValues>
 * - or a single color
 */
export class ColorPreviewFormControl extends ConfigFormControl {

    constructor(label: string, optionalParams?: ControlOptionalParams) {
        super(null, label, null, optionalParams || { optional: true });
    }

    public isMultiColors = () => Array.isArray(this.value);

    public getPaletteGradients() {
        const palette = this.value as Array<ProportionedValues>;
        const min = Math.min(...palette.map(pv => pv.proportion));
        const max = Math.max(...palette.map(pv => pv.proportion));

        return palette.map(
            c => c.value + ' ' + (100 * (c.proportion - min) / (max - min)) + '%').join(',');
    }
}

export class ButtonFormControl extends ConfigFormControl {

    // disabled state of the button itself, not of the form control
    // ButtonFormControl disabled <=> not displayed, button disabled <=> displayed but disabled
    public disabledButton = false;

    // TODO remove formstate?
    constructor(
        formState: any,
        label: string,
        description: string,
        public callback: () => void,
        public disabledButtonMessage?: string,
        optionalParams?: ControlOptionalParams) {
        super(formState, label, description, optionalParams || { optional: true });
    }
}

export class TextareaFormControl extends ConfigFormControl {

    constructor(
        formState: any,
        label: string,
        description: string,
        public nbRows?: number,
        optionalParams?: ControlOptionalParams
    ) {
        super(formState, label, description, optionalParams);
    }
}
