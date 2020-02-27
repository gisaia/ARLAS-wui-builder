import { Directive, HostListener, Input, OnInit } from '@angular/core';
import { MatSnackBar, MatSelect } from '@angular/material';
import { FormControl, AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { NGXLogger } from 'ngx-logger';

/**
 * Shows a toast of the value of mat-select changes (and was previously set).
 */
@Directive({
  selector: 'mat-select[appAlertOnChange]'
})
export class AlertOnChangeDirective implements OnInit {

  constructor(
    private select: MatSelect,
    private snackBar: MatSnackBar,
    private logger: NGXLogger) { }

  // tslint:disable-next-line: no-input-rename
  @Input('appAlertOnChange') alertMessage: string;
  @Input() dependants: AbstractControl[];

  ngOnInit(): void {
    // clean dependants fields on value change
    this.select.valueChange.subscribe(val => {
      if (!!this.select.value && !!this.dependants) {
        this.dependants.forEach(d => {
          this.resetControl(d);
        });
      }
    });
  }

  // recursively reset the value of / within the AbstractControl
  private resetControl(control: AbstractControl) {
    if (control instanceof FormControl) {
      control.reset('');
    } else if (control instanceof FormGroup || control instanceof FormArray) {
      Object.keys(control.controls).forEach(key => {
        this.resetControl(control.get(key));
      });
    } else {
      this.logger.error('Unmanaged control type in AlertOnChange', control);
    }
  }

  @HostListener('openedChange', ['$event']) openedChange(value: boolean) {
    // display a snack on opening if a dependant has been changed
    const anyDependantDirty = this.dependants == null || this.dependants.map(d => d.dirty).reduce((a, b) => a || b);
    if (anyDependantDirty && !!value && !!this.select.value) {
      this.snackBar.open('Carreful! ' + this.alertMessage);
    }
  }

}
