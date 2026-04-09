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
import {
  ResultlistConfigForm
} from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder.service';
import { Component, forwardRef, OnDestroy, ViewChild } from '@angular/core';
import { FormArray } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { marker } from '@colsen1991/ngx-translate-extract-marker';
import { TranslatePipe } from '@ngx-translate/core';
import { CollectionService } from '@services/collection-service/collection.service';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { ConfigExportHelper } from '@services/main-form-manager/config-export-helper';
import { MainFormService } from '@services/main-form/main-form.service';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';
import { ConfirmModalComponent } from '@shared-components/confirm-modal/confirm-modal.component';
import { InputModalComponent } from '@shared-components/input-modal/input-modal.component';
import { ConfigFormGroup } from '@shared-models/config-form';
import { Subscription } from 'rxjs';

@Component({
  selector: 'arlas-global-result-list',
  templateUrl: './global-result-list.component.html',
  styleUrls: ['./global-result-list.component.scss'],
  imports: [
    MatTabsModule,
    MatIconModule,
    MatTooltipModule,
    TranslatePipe,
    forwardRef(() => ConfigFormGroupComponent),
    MatButtonModule
  ]
})
export class GlobalResultListComponent implements OnDestroy {

  public listsFa: FormArray<ConfigFormGroup>;
  private newAfterClosedSub: Subscription;

  private removeAfterClosedSub: Subscription;
  public preview = [];
  private editDialogRef: MatDialogRef<EditTabComponent>;

  @ViewChild('matTabGroup', { static: false }) private readonly matTabGroup: MatTabGroup;

  public constructor(
    public mainFormService: MainFormService,
    private readonly collectionService: CollectionService,
    private readonly dialog: MatDialog,
    private readonly defaultValuesService: DefaultValuesService
  ) {
    this.listsFa = this.mainFormService.resultListConfig.getResultListsFa();
    this.updatePreview();
  }

  public addResultList() {
    const dialogRef = this.dialog.open(InputModalComponent, { data: { title: marker('Tab name') }});
    this.newAfterClosedSub = dialogRef.afterClosed().subscribe(name => {
      if (name) {
        const formGroup = new ResultlistConfigForm(this.mainFormService.getMainCollection(), this.collectionService, name);
        this.defaultValuesService.setDefaultValueRecursively('analytics.widgets.resultlist', formGroup);
        this.listsFa.push(formGroup);
        setTimeout(() =>  this.matTabGroup.selectedIndex = this.listsFa.length - 1, 0);
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
        if (this.matTabGroup.selectedIndex !== 0) {
          this.matTabGroup.selectedIndex = this.matTabGroup.selectedIndex - 1;
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
