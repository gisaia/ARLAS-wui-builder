import { Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
  MatOption
} from '@angular/material/autocomplete';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInput, MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { AlertOnChangeDirective } from '@shared-directives/alert-on-change/alert-on-change.directive';
import { ResetOnChangeDirective } from '@shared-directives/reset-on-change/reset-on-change.directive';
import { SelectFormControl, SelectOption } from '@shared-models/config-form';

@Component({
  selector: 'arlas-auto-complete-select-form',
  standalone: true,
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
  public control  = input.required<SelectFormControl>();
  /**
   *  Filter used if the current form control is not bind
   * @type {InputSignal<SelectOption[]>}
   */
  public defaultAutoCompleteFilter  = input<SelectOption[]>([]);
  /**
   * Form control used when we do not bind the current control.
   * Used when this component is used into another form components eg: Ordered select
   * @type {FormControl<any>}
   */
  public defaultAutoCompleteFormControl  = new FormControl('');
  /**
   * Whether we should link current control to the form control input.
   * @type {InputSignal<boolean>}
   */
  public bindControl  = input(true);
  /**
   * Warning message to display
   * @type {InputSignal<string | undefined>}
   */
  public warningMessage  = input<string>();
  /**
   * Default key
   * @type {InputSignal<string | undefined>}
   */
  public defaultKey  = input<string>();
  /**
   * Whether we display a label
   * @type {InputSignal<boolean | undefined>}
   */
  public showLabel  = input<boolean>();

  /**
   * Emit when type a text to filter data
   * @type {OutputEmitterRef<string>}
   */
  public autoCompleteValueChange = output<string>();
  /**
   * Emit when select an option
   * @type {OutputEmitterRef<MatAutocompleteSelectedEvent>}
   */
  public autoCompleteSelectionChange =  output<MatAutocompleteSelectedEvent>();

  /**
   * Emit when clear an input
   * @type {OutputEmitterRef<MatAutocompleteSelectedEvent>}
   */
  public autoCompleteSelectionCleared =  output<boolean>();

  private destroyRef = inject(DestroyRef);

  public ngOnInit() {
    this.emitValueOnChange();
  }

  /**
   * Clear inputs
   * @param {Event} event
   * @param {HTMLElement} inputElement
   */
  public clearAutoComplete(event: Event, inputElement: HTMLElement) {
    event.stopPropagation();
    if(this.bindControl()) {
      this.control().filteredOptions = this.control().syncOptions;
      this.control().setValue('');
    } else {
      this.defaultAutoCompleteFormControl.setValue('');
      this.autoCompleteSelectionCleared.emit(true);
    }

    inputElement.nodeValue = '';
    inputElement.focus();
  }

  /**
   * Whether control is not bind emit an event when value change
   */
  public emitValueOnChange() {
    if(!this.bindControl()) {
      this.defaultAutoCompleteFormControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(value => {
          this.autoCompleteValueChange.emit(value);
        });
    }
  }
}
