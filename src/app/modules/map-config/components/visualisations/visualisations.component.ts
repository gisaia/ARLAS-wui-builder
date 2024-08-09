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
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MainFormService } from '@services/main-form/main-form.service';
import { ConfirmModalComponent } from '@shared-components/confirm-modal/confirm-modal.component';
import { camelize } from '@utils/tools';
import { Subscription } from 'rxjs';
import { marker } from '@colsen1991/ngx-translate-extract-marker';


export interface Layer {
  id: string;
  name: string;
  mode: string;
}

@Component({
  selector: 'arlas-visualisations',
  templateUrl: './visualisations.component.html',
  styleUrls: ['./visualisations.component.scss']
})
export class VisualisationsComponent implements OnInit, AfterViewChecked, OnDestroy {

  public displayedColumns: string[] = ['name', 'layers', 'displayed', 'action'];
  public layersFa: FormArray;
  public visualisationsFa: FormArray;

  private confirmDeleteSub: Subscription;

  public constructor(
    protected mainFormService: MainFormService,
    public dialog: MatDialog,
    private cdRef: ChangeDetectorRef

  ) {
    this.layersFa = this.mainFormService.mapConfig.getLayersFa();
    this.visualisationsFa = this.mainFormService.mapConfig.getVisualisationsFa();
  }

  public ngOnInit() { }

  public ngOnDestroy() {
    if (this.confirmDeleteSub) {
      this.confirmDeleteSub.unsubscribe();
    }
  }

  public ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  public camelize(text: string): string {
    return camelize(text);
  }

  public confirmDelete(visualisationId: number, visualisationName: string): void {
    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '400px',
      data: { message: marker('Do you really want to delete the visualisation set?') }
    });

    this.confirmDeleteSub = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const formGroupIndex = (this.visualisationsFa.value as any[]).findIndex(el => el.id === visualisationId);
        this.visualisationsFa.removeAt(formGroupIndex);
      }
    });
  }

  /** puts the visualisation set list in the new order after dropping */
  public drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.visualisationsFa.value, event.previousIndex, event.currentIndex);
    this.visualisationsFa.setValue(this.visualisationsFa.value);
  }
}
