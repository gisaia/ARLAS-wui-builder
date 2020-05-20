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
import { PreviewModalComponent } from '../preview-modal/preview-modal.component';
import { ContributorBuilder } from 'arlas-wui-toolkit/services/startup/contributorBuilder';
import { ArlasCollaborativesearchService, ArlasConfigService } from 'arlas-wui-toolkit';
import { FormArray } from '@angular/forms';
import { StartupService } from '@services/startup/startup.service';
import { ConfigExportHelper } from '@services/main-form-manager/config-export-helper';
import { ConfigMapExportHelper } from '@services/main-form-manager/config-map-export-helper';
import { camelize } from '@utils/tools';

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
export class LayersComponent implements OnInit {

  public displayedColumns: string[] = ['name', 'mode', 'collection', 'zoomMin', 'zoomMax', 'action'];
  public layersFa: FormArray;

  constructor(
    protected mainFormService: MainFormService,
    public dialog: MatDialog,
    private translate: TranslateService,
    private collaborativesearchService: ArlasCollaborativesearchService,
    private configService: ArlasConfigService,
    private startupService: StartupService,

  ) {
    this.layersFa = this.mainFormService.mapConfig.getLayersFa();
  }

  public ngOnInit() {
  }

  public confirmDelete(layerId: number, layerName: string): void {
    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '400px',
      data: { message: this.translate.instant('delete the layer') + ' ' + layerName + '?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const formGroupIndex = (this.layersFa.value as any[]).findIndex(el => el.id === layerId);
        this.layersFa.removeAt(formGroupIndex);
      }
    });
  }

  public preview(layerId: number, layerName: string): void {

    // Get contributor conf part for this layer
    const formGroupIndex = (this.layersFa.value as any[]).findIndex(el => el.id === layerId);
    const mapConfigGlobal = this.mainFormService.mapConfig.getGlobalFg();
    const mapConfigLayers = new FormArray([this.layersFa.at(formGroupIndex)]);
    // Get contributor config for this layer
    // Get config.map part for this layer
    const configMap = ConfigMapExportHelper.process(mapConfigLayers);
    const contribConfig = ConfigExportHelper.getMapContributor(mapConfigGlobal, mapConfigLayers);
    // Add contributor part in arlasConfigService
    // Add web contributors in config if not exist
    const currentConfig = this.startupService.getConfigWithInitContrib();
    // update arlasConfigService with layer info
    // Create mapcontributor
    const mapContributor = currentConfig.arlas.web.contributors.find(c => c.type = 'map');
    if (mapContributor) {
      currentConfig.arlas.web.contributors.splice(currentConfig.arlas.web.contributors.indexOf(mapContributor), 1);
    }
    currentConfig.arlas.web.contributors.push(contribConfig);
    this.configService.setConfig(currentConfig);
    const contributor = ContributorBuilder.buildContributor('map',
      'mapbox',
      this.configService,
      this.collaborativesearchService);
    const dialogRef = this.dialog.open(PreviewModalComponent, {
      width: '80%',
      height: '80%',
      data: {
        mapglContributor: contributor,
        idField: 'id',
        initZoom: 15,
        initCenter: [
          -5.49213,
          36.18482
        ],
        layers: configMap.layers
      }
    });
    dialogRef.afterClosed().subscribe(() => {
      // TODO Clean ArlasConfigService
      this.collaborativesearchService.registry.clear();
    });
  }

  public camelize(text: string): string {
    return camelize(text);
  }
}
