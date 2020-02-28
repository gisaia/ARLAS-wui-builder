import { Injectable } from '@angular/core';
import { DefaultValuesService } from '../default-values/default-values.service';
import { FormBuilder, AbstractControlOptions, AbstractControl, FormGroup, FormArray } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormBuilderWithDefaultService {

  constructor(
    private defaultValuesService: DefaultValuesService,
    private formBuilder: FormBuilder) { }

  public group(
    defaultValueKey: string,
    controlsConfig: { [key: string]: any; },
    options?: AbstractControlOptions | { [key: string]: any; } | null): FormGroup {

    const builtGroup = this.formBuilder.group(controlsConfig, options);
    this.setDefaultValueRecursively(defaultValueKey, builtGroup);
    return builtGroup;
  }

  private setDefaultValueRecursively(path: string, control: AbstractControl) {

    if (control instanceof FormGroup || control instanceof FormArray) {
      Object.keys(control.controls).forEach(c => {
        this.setDefaultValueRecursively(path + '.' + c, control.controls[c]);
      });
    } else {
      const defaultValue = this.defaultValuesService.getValue(path);
      if (!!defaultValue) {
        control.setValue(defaultValue);
      }
    }
  }

}
