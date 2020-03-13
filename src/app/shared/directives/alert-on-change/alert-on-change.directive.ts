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
import { Directive, ElementRef, HostListener, Input, OnInit, Optional } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MatSelect, MatSnackBar } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { NGXLogger } from 'ngx-logger';

/**
 * Shows a toast of the value of mat-select changes (and was previously set).
 */
@Directive({
  selector: '[appAlertOnChange]'
})
export class AlertOnChangeDirective implements OnInit {

  constructor(
    private logger: NGXLogger,
    @Optional() private select: MatSelect,
    private elementRef: ElementRef<HTMLInputElement>,
    private snackBar: MatSnackBar,
    private translate: TranslateService) { }

  // tslint:disable-next-line: no-input-rename
  @Input('appAlertOnChange') alertMessage: string;
  @Input() dependants: AbstractControl[];

  // 2 cases are managed in different ways:
  // - host is a regular html input, then we can simply use the native element
  // to attach a listener and get the current value
  // - host is a MatSelect: this is a pure angular component, this is handled through angular

  ngOnInit(): void {
    const nativeElement = this.elementRef.nativeElement;
    if (!this.select) {
      nativeElement.onfocus = (e: Event) => {
        const anyDependantDirty = this.dependants == null || this.dependants.filter(d => d.dirty).length > 0;
        if (anyDependantDirty && !!nativeElement.value) {
          this.snackBar.open(this.translate.instant('Carreful!') + ' ' + this.translate.instant(this.alertMessage));
        }
      };
    }
  }

  @HostListener('openedChange', ['$event']) openedChange(value: boolean) {
    // display a snack on opening if a dependant has been changed
    const anyDependantDirty = this.dependants == null || this.dependants.filter(d => d.dirty).length > 0;
    // display the warning only if a value is already set AND if any dependency has been changed
    if (anyDependantDirty && !!value && !!this.select.value) {
      this.snackBar.open(this.translate.instant('Carreful!') + ' ' + this.translate.instant(this.alertMessage));
    }
  }

}
