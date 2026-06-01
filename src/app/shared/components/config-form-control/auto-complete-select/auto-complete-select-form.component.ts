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
import {Component, DestroyRef, inject, input, OnInit, output} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {
    MatAutocomplete,
    MatAutocompleteSelectedEvent,
    MatAutocompleteTrigger,
    MatOption
} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {TranslateModule} from '@ngx-translate/core';
import {AlertOnChangeDirective} from '@shared-directives/alert-on-change/alert-on-change.directive';
import {ResetOnChangeDirective} from '@shared-directives/reset-on-change/reset-on-change.directive';
import {SelectFormControl, SelectOption} from '@shared-models/config-form';

@Component({
    selector: 'arlas-auto-complete-select-form',
    imports: [
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        MatIconModule,
        MatAutocompleteTrigger,
        ReactiveFormsModule,
        TranslateModule,
        MatAutocomplete,
        AlertOnChangeDirective,
        ResetOnChangeDirective,
        MatOption,
    ],
    templateUrl: './auto-complete-select-form.component.html',
    styleUrl: './auto-complete-select-form.component.scss'
})
export class AutoCompleteSelectFormComponent implements OnInit {
    /**
     *  Current control
     * @type {InputSignal<SelectFormControl>}
     */
    public control = input.required<SelectFormControl>();
    /**
     *  Filter used if the current form control is not bind
     * @type {InputSignal<SelectOption[]>}
     */
    public defaultAutoCompleteFilter = input<SelectOption[]>([]);
    /**
     * If we need to assign the autocomplete value to the current control.
     * In some cases, we want to decouple the value entered the input from the one typed in the filter.
     * @type {InputSignal<boolean>}
     */
    public assignAutocompleteValueToControl = input(true);
    /**
     * Warning message to display
     * @type {InputSignal<string | undefined>}
     */
    public warningMessage = input<string>();
    /**
     * Default key
     * @type {InputSignal<string | undefined>}
     */
    public defaultKey = input<string>();
    /**
     * Whether to display a label
     * @type {InputSignal<boolean | undefined>}
     */
    public showLabel = input<boolean>();

    /**
     * Emit when type a text to filter data
     * @type {OutputEmitterRef<string>}
     */
    public autoCompleteValueChange = output<string>();
    /**
     * Emit when select an option
     * @type {OutputEmitterRef<MatAutocompleteSelectedEvent>}
     */
    public autoCompleteSelectionChange = output<MatAutocompleteSelectedEvent>();

    /**
     * Emit when clear an input
     * @type {OutputEmitterRef<MatAutocompleteSelectedEvent>}
     */
    public autoCompleteSelectionCleared = output<boolean>();

    /**
     * Form control used when you want to enable autocomplete in another component.
     * This form control is called when `assignAutocompleteValueToControl` is set to `false`.
     * This allows autocomplete events to be sent back to the host component. eg: Ordered select
     * @type {FormControl<any>}
     */
    public autoCompleteControl = new FormControl('');

    private readonly destroyRef = inject(DestroyRef);

    public ngOnInit() {
        this.emitValueOnChange();
    }

    /**
     * Clear inputs
     * @param {Event} event
     * @param {HTMLElement} inputElement
     */
    public clearAutoComplete(event: Event) {
        event.stopPropagation();
        if (this.assignAutocompleteValueToControl()) {
            this.control().filteredOptions = this.control().syncOptions;
            this.control().reset();
        } else {
            this.autoCompleteControl.reset();
        }
        this.autoCompleteSelectionCleared.emit(true);
    }

    /**
     * Emits an event on autoCompleteControl value change. This is emitted only when the autocmpleteValue is not assigned to this control
     */
    public emitValueOnChange() {
        if (!this.assignAutocompleteValueToControl()) {
            this.autoCompleteControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(value => {
                    this.autoCompleteValueChange.emit(value);
                });
        }
    }
}
