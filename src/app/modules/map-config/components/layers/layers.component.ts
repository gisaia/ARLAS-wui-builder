/*
Licensed to Gisaïa under one or more contributor
license agreements. See the NOTICE.txt file distributed with
this work for additional information regarding copyright
ownership. Gisaïa licenses this file to you under
the Apache License, Version 2.0 (the "License"); you may
not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MainFormService } from '@services/main-form/main-form.service';
import { ConfirmModalComponent } from '@shared-components/confirm-modal/confirm-modal.component';
import { LayersComponentForm } from './layers.component.form';
import { MainFormImportExportService } from '@services/main-form-import-export/main-form-import-export.service';
import { TranslateService } from '@ngx-translate/core';

export interface Layer {
  id: string;
  name: string;
  mode: string;
}

@Component({
  selector: 'app-layers',
  templateUrl: './layers.component.html',
  styleUrls: ['./layers.component.scss']
})
export class LayersComponent extends LayersComponentForm implements OnInit {

  public displayedColumns: string[] = ['name', 'mode', 'edit', 'delete'];

  constructor(
    protected mainFormService: MainFormService,
    public dialog: MatDialog,
    private translate: TranslateService
  ) {
    super(mainFormService);
  }

  ngOnInit() {
  }

  public confirmDelete(layerId: number, layerName: string): void {
    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '400px',
      data: { message: this.translate.instant('delete the layer') +  ' ' + layerName + '?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const formGroupIndex = (this.layersFa.value as any[]).findIndex(el => el.id === layerId);
        this.layersFa.removeAt(formGroupIndex);
      }
    });
  }

}
