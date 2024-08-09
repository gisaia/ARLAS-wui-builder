/*
 * Licensed to Gisaïa under one or more contributor
 * license agreements. See the NOTICE.txt file distributed with
 * this work for additional information regarding copyright
 * ownership. Gisaïa licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { Injectable } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { ConfirmModalComponent } from '@shared-components/confirm-modal/confirm-modal.component';
import { Observable } from 'rxjs';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

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

  public constructor(
    public dialog: MatDialog) {
  }

  public canDeactivate(
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
        data: { message: marker('Do you really want to exit without saving?') }
      });
      return dialogRef.afterClosed();
    } else {
      return true;
    }
  }
}
