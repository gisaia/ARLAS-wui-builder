import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';
import { ConfirmModalComponent } from '@app/shared/components/confirm-modal/confirm-modal.component';

/**
 * To be implements by components that need a confirmation before changing location
 */
export interface CanComponentExit {
  canExit: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmExitGuard implements CanDeactivate<CanComponentExit> {

  constructor(public dialog: MatDialog) {
  }

  canDeactivate(
    component: CanComponentExit,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    if (!component.canExit) {
      console.error('Checking if component can exit whereas it does not implement the required interface');
      // component does not implement required interfae
      return true;
    }

    if (!component.canExit()) {
      const dialogRef = this.dialog.open(ConfirmModalComponent, {
        width: '400px',
        data: { message: 'exit without saving?' }
      });
      return dialogRef.afterClosed();
    } else {
      return true;
    }
  }
}
