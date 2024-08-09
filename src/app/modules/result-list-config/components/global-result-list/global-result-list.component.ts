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

import { EditTabComponent } from '@analytics-config/components/edit-tab/edit-tab.component';
import { ResultlistConfigForm } from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder.service';
import { Component, OnDestroy } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { CollectionService } from '@services/collection-service/collection.service';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { ConfigExportHelper } from '@services/main-form-manager/config-export-helper';
import { MainFormService } from '@services/main-form/main-form.service';
import { ConfirmModalComponent } from '@shared-components/confirm-modal/confirm-modal.component';
import { InputModalComponent } from '@shared-components/input-modal/input-modal.component';
import { Subscription } from 'rxjs';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

@Component({
  selector: 'arlas-global-result-list',
  templateUrl: './global-result-list.component.html',
  styleUrls: ['./global-result-list.component.scss']
})
export class GlobalResultListComponent implements OnDestroy {

  public listsFa: FormArray;
  private newAfterClosedSub: Subscription;
  public selected = new FormControl(0);

  private removeAfterClosedSub: Subscription;
  public preview = [];
  private editDialogRef: MatDialogRef<EditTabComponent>;

  public constructor(
    public mainFormService: MainFormService,
    private collectionService: CollectionService,
    private dialog: MatDialog,
    private defaultValuesService: DefaultValuesService
  ) {
    this.listsFa = this.mainFormService.resultListConfig.getResultListsFa();
    this.updatePreview();
  }

  public addResultList() {
    const dialogRef = this.dialog.open(InputModalComponent);
    this.newAfterClosedSub = dialogRef.afterClosed().subscribe(name => {
      if (name) {
        const formGroup = new ResultlistConfigForm(this.mainFormService.getMainCollection(), this.collectionService, name);
        this.defaultValuesService.setDefaultValueRecursively('analytics.widgets.resultlist', formGroup);
        this.listsFa.push(formGroup);
        this.selected.setValue(this.listsFa.length - 1);
      }
    });
  }

  public updatePreview() {
    this.preview = ConfigExportHelper.getResultListComponent(this.listsFa);
  }

  public ngOnDestroy() {
    if (this.newAfterClosedSub) {
      this.newAfterClosedSub.unsubscribe();
    }
    if (this.removeAfterClosedSub) {
      this.removeAfterClosedSub.unsubscribe();
    }
  }

  public removeTab(tabIndex: number) {
    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '400px',
      data: { message: marker('Do you really want to delete this list?') }
    });

    this.removeAfterClosedSub = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.listsFa.removeAt(tabIndex);
        if (this.selected.value !== 0) {
          this.selected.setValue(this.selected.value - 1);
        }
      }
    });
  }

  public configTab(tabIndex: number){
    const tab = this.listsFa.at(tabIndex);
    this.editDialogRef = this.dialog.open(EditTabComponent, {
      data: {
        name: tab.value.title,
        icon: tab.value.icon,
        showName: tab.value.showName,
        showIcon: tab.value.showIcon
      }
    });

    this.editDialogRef.afterClosed().subscribe( result => {
      if (result) {
        tab.get('title').setValue(result.name);
        tab.get('icon').setValue(result.icon);
        tab.get('showName').setValue(result.showName);
        tab.get('showIcon').setValue(result.showIcon);
      }
    });
  }

}
