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
  DataGroupEditionComponent
} from '@analytics-config/components/edit-resultlist-visualisation/data-group-edition/data-group-edition.component';
import {
  ResultListVisualisationsDataGroupFilter
} from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder';
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
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { filter, first } from 'rxjs';

@Component({
  selector: 'arlas-manage-visualisation',
  standalone: true,
  imports: [
    TranslateModule,
    SharedModule
  ],
  templateUrl: './manage-visualisation.component.html',
  styleUrl: './manage-visualisation.component.scss',

})
export class ManageVisualisationComponent {
  protected visualisation = input<ResultListVisualisationsFormGroup>();
  protected isEdition = input<boolean>();
  protected collectionControlName = input<string>('');
  @ViewChild(MatTable) protected table: MatTable<ResultListVisualisationsFormGroup>;
  protected dialog = inject(MatDialog);
  protected resultlistFormBuilderService = inject(ResultlistFormBuilderService);
  protected validate = output<boolean>();
  protected cancel = output<boolean>();
  protected displayedColumns = ['drag', 'dataGroup', 'protocol', 'visualisationUrl', 'conditions', 'actions'];
  public dragDisabled = true;

  public get dataGroups(): FormArray<ResultListVisualisationsDataGroup> | any[] {
    return this.visualisation().get('dataGroups')?.value.length > 0 ?  (<any>this.visualisation().get('dataGroups')).controls as FormArray  : [];
  }

  public validateVisualisation(){
    this.validate.emit(true);
  }
  public cancelVisualisation(){
    this.cancel.emit(true);
  }

  public dropItemFamily(event: CdkDragDrop<any[]>){
    const previousIndex = (this.visualisation().get('dataGroups') as FormArray).controls.findIndex(row => row === event.item.data);
    moveItemInArray((this.visualisation().get('dataGroups') as FormArray).controls, previousIndex, event.currentIndex);
    this.dragDisabled = true;
    this.table.renderRows();
  }


  public editDataGroup(itemIndex: number){
    const dataGroup = (this.visualisation().get('dataGroups') as FormArray).at(itemIndex) as ResultListVisualisationsDataGroup;
    this.openEditionDialog(dataGroup, true);
  }

  public removeDataGroup(itemIndex: number) {
    (this.visualisation().get('dataGroups') as FormArray).removeAt(itemIndex);
    this.table.renderRows();
  }

  public openEditionDialog(dataGroup: ResultListVisualisationsDataGroup, edit = false){
    return this.dialog.open(DataGroupEditionComponent,
      {
        width:'50vw',
        height: '90vh',
        data: {
          edit,
          dataGroup,
          collectionControlName: this.collectionControlName()
        }
      }
    );
  }

  public addDataGroup() {
    const dataGroup = this.resultlistFormBuilderService.buildVisualisationsDataGroup();
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
