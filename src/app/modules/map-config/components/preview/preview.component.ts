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

import { Component, Inject, OnInit, AfterViewInit, ViewChild, Input, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MapContributor } from 'arlas-web-contributors';
import { MapglComponent } from 'arlas-web-components';
import { ArlasCollaborativesearchService, ArlasConfigService, ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { MainFormService } from '@services/main-form/main-form.service';
import { ConfigMapExportHelper } from '@services/main-form-manager/config-map-export-helper';
import { ConfigExportHelper } from '@services/main-form-manager/config-export-helper';
import { StartupService } from '@services/startup/startup.service';
import { ContributorBuilder } from 'arlas-wui-toolkit/services/startup/contributorBuilder';
import { CollectionService } from '@services/collection-service/collection.service';
import { Subscription } from 'rxjs';

export interface MapglComponentInput {
  mapglContributor: MapContributor;
  mapComponentConfig: any;
}

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements AfterViewInit, OnDestroy {

  @Input() public mapComponentConfig: any;
  @Input() public mapglContributor: MapContributor;
  @ViewChild('map', { static: false }) public mapglComponent: MapglComponent;

  private onMapLoadSub: Subscription;

  constructor(
    protected mainFormService: MainFormService,
    private collaborativeService: ArlasCollaborativesearchService,
    private configService: ArlasConfigService,
    private startupService: StartupService,
    private collectionService: CollectionService,
    private colorService: ArlasColorGeneratorLoader,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public dataMap: MapglComponentInput
  ) {
    if (this.dataMap.mapglContributor !== undefined || this.dataMap.mapComponentConfig !== undefined) {
      this.mapglContributor = dataMap.mapglContributor;
      this.mapComponentConfig = dataMap.mapComponentConfig.input;
    } else {
      // Get contributor conf part for this layer
      const mapConfigGlobal = this.mainFormService.mapConfig.getGlobalFg();
      const mapConfigLayers = this.mainFormService.mapConfig.getLayersFa();
      const mapConfigVisualisations = this.mainFormService.mapConfig.getVisualisationsFa();
      const mapConfigBasemaps = this.mainFormService.mapConfig.getBasemapsFg();
      // Get contributor config for this layer
      // Get config.map part for this layer
      const configMap = ConfigMapExportHelper.process(mapConfigLayers, colorService, this.collectionService.taggableFields);
      const contribConfig = ConfigExportHelper.getMapContributor(mapConfigGlobal, mapConfigLayers);
      // Add contributor part in arlasConfigService
      // Add web contributors in config if not exist
      const currentConfig = this.startupService.getConfigWithInitContrib();
      // update arlasConfigService with layer info
      // Create mapcontributor
      const mapContributor = currentConfig.arlas.web.contributors.find(c => c.type === 'map');
      if (mapContributor) {
        currentConfig.arlas.web.contributors.splice(currentConfig.arlas.web.contributors.indexOf(mapContributor), 1);
      }
      currentConfig.arlas.web.contributors.push(contribConfig);
      this.configService.setConfig(currentConfig);
      const contributor = ContributorBuilder.buildContributor('map',
        'mapbox',
        this.configService,
        this.collaborativeService,
        this.colorService);
      const mapComponentConfig = ConfigExportHelper.getMapComponent(
        mapConfigGlobal,
        mapConfigLayers,
        mapConfigVisualisations,
        mapConfigBasemaps
      );
      mapComponentConfig.input.mapLayers.layers = configMap.layers;

      this.mapglContributor = contributor;
      this.mapComponentConfig = mapComponentConfig.input;
    }
  }

  public ngAfterViewInit() {
    this.onMapLoadSub = this.mapglComponent.onMapLoaded.subscribe(isLoaded => {
      if (isLoaded && !!this.mapglContributor) {
        this.mapglContributor.updateData = true;
        this.mapglContributor.fetchData(null);
        this.mapglContributor.setSelection(null, this.collaborativeService.getCollaboration(this.mapglContributor.identifier));
      }
    });
    this.cdr.detectChanges();
  }

  public ngOnDestroy() {
    this.mapglComponent = null;
    this.onMapLoadSub.unsubscribe();
  }
}
