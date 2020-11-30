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
import { TranslateService } from '@ngx-translate/core';
import { MainFormService } from '@services/main-form/main-form.service';
import { ConfirmModalComponent } from '@shared-components/confirm-modal/confirm-modal.component';
import { PreviewComponent } from '../preview/preview.component';
import { ContributorBuilder } from 'arlas-wui-toolkit/services/startup/contributorBuilder';
import { ArlasCollaborativesearchService, ArlasConfigService } from 'arlas-wui-toolkit';
import { FormArray } from '@angular/forms';
import { StartupService } from '@services/startup/startup.service';
import { ConfigExportHelper } from '@services/main-form-manager/config-export-helper';
import { ConfigMapExportHelper, VISIBILITY } from '@services/main-form-manager/config-map-export-helper';
import { camelize } from '@utils/tools';
import { MapglLegendComponent } from 'arlas-web-components';
import { Paint, Layer as LayerMap } from '@services/main-form-manager/models-map-config';
import { LAYER_MODE } from '@map-config/components/edit-layer/models';
import { GEOMETRY_TYPE } from '@map-config/services/map-layer-form-builder/models';

export interface Layer {
  id: string;
  name: string;
  mode: string;
}

@Component({
  selector: 'app-visualisations',
  templateUrl: './visualisations.component.html',
  styleUrls: ['./visualisations.component.scss']
})
export class VisualisationsComponent implements OnInit {

  public displayedColumns: string[] = ['name', 'layers', 'displayed', 'action'];
  public layersFa: FormArray;
  public visualisationsFa: FormArray;

  constructor(
    protected mainFormService: MainFormService,
    public dialog: MatDialog

  ) {
    this.layersFa = this.mainFormService.mapConfig.getLayersFa();
    this.visualisationsFa = this.mainFormService.mapConfig.getVisualisationsFa();
  }

  public ngOnInit() {

  }

  public camelize(text: string): string {
    return camelize(text);
  }

  public confirmDelete(visualisationId: number, visualisationName: string): void {
    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '400px',
      data: { message: 'delete the visualisation set' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const formGroupIndex = (this.visualisationsFa.value as any[]).findIndex(el => el.id === visualisationId);
        this.visualisationsFa.removeAt(formGroupIndex);
      }
    });
  }
}
