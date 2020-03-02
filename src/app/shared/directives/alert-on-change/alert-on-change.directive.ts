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
