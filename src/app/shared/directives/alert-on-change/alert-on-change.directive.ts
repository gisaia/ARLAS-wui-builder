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
import { Directive, HostListener, Input } from '@angular/core';
import { MatSnackBar, MatSelect } from '@angular/material';
import { AbstractControl } from '@angular/forms';
import { NGXLogger } from 'ngx-logger';

/**
 * Shows a toast of the value of mat-select changes (and was previously set).
 */
@Directive({
  selector: 'mat-select[appAlertOnChange]'
})
export class AlertOnChangeDirective {

  constructor(
    private logger: NGXLogger,
    private select: MatSelect,
    private snackBar: MatSnackBar) { }

  // tslint:disable-next-line: no-input-rename
  @Input('appAlertOnChange') alertMessage: string;
  @Input() dependants: AbstractControl[];

  @HostListener('openedChange', ['$event']) openedChange(value: boolean) {
    // display a snack on opening if a dependant has been changed
    const anyDependantDirty = this.dependants == null || this.dependants.filter(d => d.dirty).length > 0;
    // display the warning only if a value is already set AND if any dependency has been changed
    if (anyDependantDirty && !!value && !!this.select.value) {
      this.snackBar.open('Carreful! ' + this.alertMessage);
    }
  }

}
