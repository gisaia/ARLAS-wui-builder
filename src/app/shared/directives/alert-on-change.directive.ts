import { Directive, HostListener, Input, OnInit } from '@angular/core';
import { MatSnackBar, MatSelect } from '@angular/material';
import { FormControl } from '@angular/forms';

/**
 * Shows a toast of the value of mat-select changes (and was previously set).
 */
@Directive({
  selector: 'mat-select[appAlertOnChange]'
})
export class AlertOnChangeDirective implements OnInit {

  constructor(private select: MatSelect, private snackBar: MatSnackBar) { }

  // tslint:disable-next-line: no-input-rename
  @Input('appAlertOnChange') alertMessage: string;
  @Input() dependants: FormControl[];

  ngOnInit(): void {
    // clean dependants fields on value change
    this.select.valueChange.subscribe(val => {
      if (!!this.select.value && !!this.dependants) {
        this.dependants.forEach(d => {
          d.reset('');
        });
      }
    });
  }

  @HostListener('openedChange', ['$event']) openedChange(value: boolean) {
    // display a snack on opening if a dependant has been changed
    const anyDependantDirty = this.dependants == null || this.dependants.map(d => d.dirty).reduce((a, b) => a || b);
    if (anyDependantDirty && !!value && !!this.select.value) {
      this.snackBar.open('Carreful! ' + this.alertMessage);
    }
  }

}
