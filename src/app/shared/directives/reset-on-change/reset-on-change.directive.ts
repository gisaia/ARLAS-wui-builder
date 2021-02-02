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
import { Directive, ElementRef, Input, OnInit, Optional, OnDestroy } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MatSlideToggle, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { NGXLogger } from 'ngx-logger';
import { ConfigFormControl } from '@shared-models/config-form';
import { MatButtonToggleGroup } from '@angular/material';
import { Subscription } from 'rxjs';

/**
 * Reset the dependants fields when the directive component value changes
 * WARNING: currently only for mat-select and mat-slide-toggle
 */
@Directive({
  selector: '[appResetOnChange]'
})
export class ResetOnChangeDirective implements OnInit, OnDestroy {

  @Input() private dependants: AbstractControl[];
  @Input('appResetOnChange') private defaultValuePrefix: string;

  private matSelectChangeSub: Subscription;
  private matSlideChangeSub: Subscription;
  private matButtonChangeSub: Subscription;

  constructor(
    private elementRef: ElementRef<HTMLInputElement>,
    @Optional() private matSelect: MatSelect,
    @Optional() private matSlideToggle: MatSlideToggle,
    @Optional() private matButtonToggle: MatButtonToggleGroup,
    private logger: NGXLogger,
    private defaultValueService: DefaultValuesService) { }

  public ngOnInit(): void {
    if (!this.defaultValuePrefix) {
      return;
    } else if (this.matSelect) {
      this.matSelectChangeSub = this.matSelect.valueChange.subscribe((value: any) => this.resetDependants());
    } else if (this.matSlideToggle) {
      this.matSlideChangeSub = this.matSlideToggle.change.subscribe(
        (event: MatSlideToggleChange) => this.resetDependants());
    } else if (this.matButtonToggle) {
      this.matButtonChangeSub = this.matButtonToggle.change.subscribe(
        event => this.resetDependants());
    } else {
      // at least we guess this is a regulr html input
      this.elementRef.nativeElement.onchange = (e: Event) => {
        this.resetDependants();
      };
    }
  }

  public ngOnDestroy() {
    this.defaultValuePrefix = null;
    this.dependants = null;
    if (this.matSelectChangeSub) { this.matSelectChangeSub.unsubscribe(); }
    if (this.matSlideChangeSub) { this.matSlideChangeSub.unsubscribe(); }
    if (this.matSlideChangeSub) { this.matSlideChangeSub.unsubscribe(); }
  }

  private resetDependants() {
    if (!!this.dependants) {
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
      if (control instanceof ConfigFormControl && !!control.initialValue) {
        control.reset(control.initialValue);
      } else {
        // reset to the default value of the control, or null if no default value prefix provided
        if (!this.defaultValuePrefix) {
          return null;
        }
        control.reset(this.findDefaultValue(control));
      }
    } else if (control instanceof FormGroup || control instanceof FormArray) {
      // reset inner FormControls
      Object.keys(control.controls).forEach(key => {
        this.resetControl(control.get(key));
      });
    }
  }

  /**
   *
   * Search a default value of the control recursively.
   * If the control has for hierarchy root.subgroup.control
   * then it first looks for defaultValuePrefix.control
   * then defaultValuePrefix.subgroup.control
   * then defaultValuePrefix.root.subgroup.control
   */
  private findDefaultValue(control: AbstractControl, path?: string) {
    const searchValue = this.defaultValueService.getValue(!!path ? this.defaultValuePrefix + '.' + path : this.defaultValuePrefix);

    // searchValue is an object if we're not at the final control level
    if (searchValue && typeof searchValue !== 'object') {
      return searchValue;
    } else if (!!control.parent) {
      // find the name of the control into its parent control
      let controlName: string;
      Object.keys(control.parent.controls).forEach(key => {
        if (control.parent.controls[key] === control) {
          controlName = key;
        }
      });
      return this.findDefaultValue(control.parent, !!path ? controlName + '.' + path : controlName);
    } else {
      return null;
    }
  }

}
