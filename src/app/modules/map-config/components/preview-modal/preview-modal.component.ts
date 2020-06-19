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

import { Component, Inject, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MapContributor } from 'arlas-web-contributors';
import { MapglComponent } from 'arlas-web-components';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';

export interface MapglComponentInput {
  mapglContributor: MapContributor;
  idField: string;
  initZoom: number;
  initCenter: Array<number>;
  layers: Array<any>;
}

@Component({
  selector: 'app-preview-modal',
  templateUrl: './preview-modal.component.html',
  styleUrls: ['./preview-modal.component.scss']
})
export class PreviewModalComponent implements OnInit, AfterViewInit {

  public mapComponentConfig;
  public mapglContributor: MapContributor;
  @ViewChild('map', { static: false }) public mapglComponent: MapglComponent;

  constructor(
    public dialogRef: MatDialogRef<PreviewModalComponent>,
    @Inject(MAT_DIALOG_DATA) public dataMap: MapglComponentInput,
    private collaborativeService: ArlasCollaborativesearchService) {
    const layerID = dataMap.layers.length > 0 ? dataMap.layers[0].id : undefined;
    this.mapglContributor = dataMap.mapglContributor;
    this.mapComponentConfig = {
      idFeatureField: dataMap.idField,
      defaultBasemapStyle: {
        name: 'Positron',
        styleFile: 'http://demo.arlas.io:82/styles/positron/style.json'
      },
      basemapStyles: [
        {
          name: 'Positron',
          styleFile: 'http://demo.arlas.io:82/styles/positron/style.json'
        }
      ],
      margePanForLoad: 40,
      margePanForTest: 2,
      initZoom: dataMap.initZoom,
      initCenter: dataMap.initCenter,
      displayScale: true,
      mapLayers: {
        layers: dataMap.layers,
        externalEventLayers: [
        ],
        styleGroups: [
          {
            id: 'preview',
            name: 'Preview',
            base: [
            ],
            styles: [
              {
                id: 'preview',
                name: 'Preview',
                layerIds: [
                  layerID
                ],
                isDefault: true
              }
            ]
          }
        ],
        events: {
          zoomOnClick: [
            layerID
          ],
          emitOnClick: [
            layerID
          ],
          onHover: [
            layerID
          ]
        }
      },
      visualisations_sets: [
        {
          name: 'layers',
          layers: [layerID],
          enabled: true
        }
      ]
    };
  }

  public ngOnInit() {

  }

  public ngAfterViewInit() {
    this.mapglComponent.onMapLoaded.subscribe(isLoaded => {
      if (isLoaded && !!this.mapglContributor) {
        this.mapglContributor.updateData = true;
        this.mapglContributor.fetchData(null);
        this.mapglContributor.setSelection(null, this.collaborativeService.getCollaboration(this.mapglContributor.identifier));
      }
    });
  }
}
