import { LowerCasePipe, NgForOf, NgIf } from '@angular/common';
import { Component, computed, input, OnInit, signal, viewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { MatChipListbox, MatChipOption, MatChipRemove } from '@angular/material/chips';
import { MatOption } from '@angular/material/core';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatRadioButton, MatRadioChange, MatRadioGroup } from '@angular/material/radio';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import {
  AutoCompleteSelectFormComponent
} from '@shared-components/config-form-control/auto-complete-select/auto-complete-select-form.component';
import { OrderedSelectFormControl, SelectOption } from '@shared-models/config-form';
import { first } from 'rxjs';

@Component({
  selector: 'arlas-ordered-select',
  standalone: true,
  imports: [
    LowerCasePipe,
    MatButton,
    MatChipListbox,
    MatChipOption,
    MatChipRemove,
    MatError,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    MatOption,
    MatRadioButton,
    MatRadioGroup,
    MatSelect,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    TranslateModule,
    FormsModule,
    AutoCompleteSelectFormComponent
  ],
  templateUrl: './ordered-select.component.html',
  styleUrl: './ordered-select.component.scss'
})
export class OrderedSelectComponent implements OnInit {
  /**
   * Current form control
   * @type {InputSignal<OrderedSelectFormControl>}
   */
  public control = input.required<OrderedSelectFormControl>();
  /**
   * When in auto mode, do not link the autocompletion component with the current control.
   * Otherwise, there will be display issues.
   * @type {Signal<boolean>}
   */
  public bindCurrentControl = computed(() => !this.control().isAutocomplete);
  /**
   *  Whether we  display a label
   * @type {InputSignal<boolean | undefined>}
   */
  public showLabel = input<boolean>();

  /**
   * Current form value
   * @type {string}
   * @protected
   */
  protected formValue = signal('');

  /**
   * Options when in auto complete mode.
   * @type {SelectOption[]}
   * @protected
   */
  protected filteredOptions = signal<SelectOption[]>([]) ;

  public ngOnInit() {
    this.setDefaultFiltersOptions();
  }

  /**
   * Update filter when we there are a new value from the auto complete form.
   * @param {string} filter
   */
  public updateFilter(filter: string) {
    if (this.control().isAutocomplete) {
      let update;
      if (!!filter) {
        update = this.control().syncOptions.filter(o => o.label.indexOf(filter) >= 0);
      } else {
        update = this.control().syncOptions;
      }
      this.filteredOptions.update(() => update);
    }
  }

  /**
   * Add a new sort value to form control
   * @param $event
   * @protected
   */
  protected addSort($event) {
    this.control().addSort(`${this.control().sortDirection}${this.formValue()}`, $event);
    // this.resetFilter();
  }

  /**
   * Update sort direction
   * @param {MatRadioChange} $event
   * @protected
   */
  protected updateSortDirection($event: MatRadioChange) {
    this.control().sortDirection = $event.value;
  }

  /**
   * Set default value for filtered data
   * @private
   */
  private setDefaultFiltersOptions() {
    if (this.control().isAutocomplete) {
      this.control().syncOptionsSet$.pipe(first()).subscribe(() => {
        this.filteredOptions.update(() => this.control().syncOptions.slice());
      });
    }
  }

  /**
   * Reste filters options
   * @private
   */
  protected resetFilter(){
    if (this.control().isAutocomplete) {
      this.filteredOptions.update(() => this.control().syncOptions.slice());
    }
  }


  public selectSelectionChange($event: MatSelectChange) {
    if(!this.control().isAutocomplete) {
      this.formValue.set($event.value);
    }
  }

  /**
   * Update auto complete form value
   * @param {MatAutocompleteSelectedEvent} $event
   */
  public updateAutoCompleteValue($event: MatAutocompleteSelectedEvent) {
    if (this.control().isAutocomplete) {
      this.formValue.set($event.option.value);
    }
  }
}
