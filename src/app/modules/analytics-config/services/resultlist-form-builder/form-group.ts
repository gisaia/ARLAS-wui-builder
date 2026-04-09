import { FormArray, FormGroup, Validators } from '@angular/forms';
import { marker } from '@colsen1991/ngx-translate-extract-marker';
import {
    HiddenFormControl, InputFormControl, SelectFormControl, SelectOption, SliderFormControl, TextareaFormControl
} from '@shared-models/config-form';
import { Observable } from 'rxjs';

export type ResultlistDataConfigForm = FormGroup<{
  collection: SelectFormControl;
  searchSize: SliderFormControl;
  columns: FormArray;
  detailsTitle: HiddenFormControl;
  details: FormArray;
  idFieldName: HiddenFormControl;
}>;

export class ResultlistDetailFormGroup extends FormGroup {

  public constructor() {
    super({
      name: new InputFormControl(
        '',
        marker('Section'),
        ''
      ),
      fields: new FormArray([], Validators.required)
    });
  }

  public customControls = {
    name: this.get('name') as InputFormControl,
    fields: this.get('fields') as FormArray<ResultlistDetailFieldFormGroup>,
  };
}

export class ResultlistDetailFieldFormGroup extends FormGroup {

  public constructor(fieldsObs: Observable<Array<SelectOption>>) {
    super({
      label: new InputFormControl(
        '',
        marker('Detail label'),
        ''
      ),
      path: new SelectFormControl(
        '',
        marker('Detail field'),
        '',
        true,
        fieldsObs
      ),
      process: new TextareaFormControl(
        '',
        marker('Apply a calculation in javascript'),
        '',
        marker('e.g : result+\'$\''),
        1,
        {
          optional: true,
          validators: [TextareaFormControl.processValidator('result')],
        }
      )
    });
  }

  public customControls = {
    label: this.get('label') as InputFormControl,
    path: this.get('path') as SelectFormControl,
    process: this.get('process') as TextareaFormControl,
  };
}
