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
import { Directive, Input, OnInit, Host, Self, Optional } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormArray } from '@angular/forms';
import { DefaultValuesService } from '@app/services/default-values/default-values.service';
import { NGXLogger } from 'ngx-logger';
import { MatSelect, MatSlideToggle, MatSlideToggleChange } from '@angular/material';

/**
 * Reset the dependants fields when the directive component value changes
 * WARNING: currently only for mat-select and mat-slide-toggle
 */
@Directive({
  selector: '[appResetOnChange]'
})
export class ResetOnChangeDirective implements OnInit {

  @Input() dependants: AbstractControl[];
  @Input('appResetOnChange') defaultValuePrefix: string;

  constructor(
    @Optional() private matSelect: MatSelect,
    @Optional() private matSlider: MatSlideToggle,
    private logger: NGXLogger,
    private defaultValueService: DefaultValuesService) { }

  ngOnInit(): void {
    if (!this.defaultValuePrefix) {
      this.logger.error('Missing default value prefix in reset-on-change');
    }

    // clean dependants fields on value change
    if (this.matSelect) {
      this.matSelect.valueChange.subscribe((value: any) =>
        this.resetDependants(value));
    } else if (this.matSlider) {
      this.matSlider.change.subscribe(
        (event: MatSlideToggleChange) => this.resetDependants(event.checked));
    } else {
      this.logger.error('Unsupported input type for reset-on-change');
    }
  }

  private resetDependants(value: any) {
    if (!!value && !!this.dependants) {
      this.dependants.forEach(d => {
        this.resetControl(d);
      });
    }
  }

  /**
   * recursively reset the value of / within the AbstractControl
   */
  private resetControl(control: AbstractControl) {
    if (control instanceof FormControl) {
      // reset to the default value of the control
      control.reset(
        this.defaultValueService.getValue(
          this.defaultValuePrefix + '.' + this.findParentPath(control)));
    } else if (control instanceof FormGroup || control instanceof FormArray) {
      // reset inner FormControls
      Object.keys(control.controls).forEach(key => {
        this.resetControl(control.get(key));
      });
    }
  }

  /**
   * Find the parent path of the component in a FormGroup.
   * This is required to reset to default values.
   */
  private findParentPath(control: AbstractControl, path?: string) {
    if (control.parent) {
      let controlName: string;
      Object.keys(control.parent.controls).forEach(key => {
        if (control.parent.controls[key] === control) {
          controlName = key;
        }
      });
      return this.findParentPath(control.parent, path ? controlName + '.' + path : controlName);
    } else {
      return path;
    }
  }

}
