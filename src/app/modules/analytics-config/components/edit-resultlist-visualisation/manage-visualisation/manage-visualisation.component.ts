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
import {
  ManageDataGroupDialogComponent
} from '@analytics-config/components/edit-resultlist-visualisation/data-group-edition/manage-data-group-dialog.component';
import {
  ResultlistFormBuilderService,
  ResultListVisualisationsDataGroup,
  ResultListVisualisationsFormGroup
} from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, inject, input, output, ViewChild } from '@angular/core';
import { FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { marker } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmModalComponent } from '@shared-components/confirm-modal/confirm-modal.component';
import { SharedModule } from '@shared/shared.module';
import { GetFieldDisplayModule } from 'arlas-web-components';
import { filter, first } from 'rxjs';

@Component({
  selector: 'arlas-manage-visualisation',
  standalone: true,
  imports: [
    TranslateModule,
    SharedModule,
    GetFieldDisplayModule
  ],
  templateUrl: './manage-visualisation.component.html',
  styleUrl: './manage-visualisation.component.scss',

})
export class ManageVisualisationComponent {
  /**
   * Represent a visualitation
   * @type {InputSignal<ResultListVisualisationsFormGroup | undefined>}
   * @protected
   */
  protected visualisation = input<ResultListVisualisationsFormGroup>();
  /**
   * Whether it is a new visualisation or not.
   * @type {InputSignal<boolean | undefined>}
   * @protected
   */
  protected isEdition = input<boolean>(false);
  /**
   *  Collection name
   * @type {InputSignal<string>}
   * @protected
   */
  protected collectionControlName = input<string>('');
  /**
   *  Emit event to close the view
   * @type {OutputEmitterRef<boolean>}
   * @protected
   */
  protected changeValidated = output<boolean>();
  /**
   * Emit event to close the view
   * @type {OutputEmitterRef<boolean>}
   * @protected
   */
  protected changeCanceled = output<boolean>();
  protected dialog = inject(MatDialog);
  /**
   * Helper. Create right forms
   * @type {ResultlistFormBuilderService}
   * @protected
   */
  protected resultListFormBuilderService = inject(ResultlistFormBuilderService);
  /**
   * Table columns
   * @type {string[]}
   * @protected
   */
  protected displayedColumns = ['drag', 'dataGroup', 'protocol', 'visualisationUrl', 'conditions', 'actions'];
  /**
   *  Whether to enable drag and drop for rows
   * @type {boolean}
   */
  public dragDisabled = true;
  @ViewChild(MatTable) protected table: MatTable<ResultListVisualisationsFormGroup>;

  public get dataGroups(): FormArray<ResultListVisualisationsDataGroup> | any[] {
    return this.visualisation().get('dataGroups')?.value.length > 0 ?  (<any>this.visualisation().get('dataGroups')).controls as FormArray  : [];
  }

  public validateVisualisation(){
    this.changeValidated.emit(true);
  }
  public cancelVisualisation(){
    if(this.visualisation().dirty && !this.isEdition()) {
      const confirm = this.dialog.open(ConfirmModalComponent, {
        data: {
          message: marker('Your data has been modified do you want to leave ?')
        }
      });

      confirm
        .afterClosed()
        .pipe(
          first(),
          filter((response: boolean) => response)
        )
        .subscribe( response => {
          this.changeCanceled.emit(response);
        });
    } else {
      this.changeCanceled.emit(true);
    }
  }

  public dropItemFamily(event: CdkDragDrop<any[]>){
    const previousIndex = (this.visualisation().get('dataGroups') as FormArray).controls.findIndex(row => row === event.item.data);
    moveItemInArray((this.visualisation().get('dataGroups') as FormArray).controls, previousIndex, event.currentIndex);
    this.dragDisabled = true;
    this.table.renderRows();
  }

  public editDataGroup(itemIndex: number, ev?: KeyboardEvent){
    if(ev && ev.key !== 'Enter') {
      return;
    }
    const dataGroup = (this.visualisation().get('dataGroups') as FormArray).at(itemIndex) as ResultListVisualisationsDataGroup;
    this.openEditionDialog(dataGroup, true);
  }

  public removeDataGroup(itemIndex: number, ev?: KeyboardEvent) {
    if(ev && ev.key !== 'Enter') {
      return;
    }
    (this.visualisation().get('dataGroups') as FormArray).removeAt(itemIndex);
    this.table.renderRows();
  }

  public openEditionDialog(dataGroup: ResultListVisualisationsDataGroup, edit = false){
    return this.dialog.open(ManageDataGroupDialogComponent,
      {
        width:'65vw',
        height: '90vh',
        disableClose: true,
        data: {
          edit,
          dataGroup,
          collectionControlName: this.collectionControlName()
        }
      }
    );
  }

  public addDataGroup() {
    const dataGroup = this.resultListFormBuilderService.buildVisualisationsDataGroup();
    dataGroup.get('name').setValue(marker('New data group'));
    const ref = this.openEditionDialog(dataGroup);

    ref.afterClosed()
      .pipe(
        first(),
        filter( (validate: boolean) => validate)
      )
      .subscribe(_ => {
        (this.visualisation().get('dataGroups') as FormArray).push(dataGroup);
        this.table.renderRows();
      });
  }
}
