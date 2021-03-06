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
import { Injectable } from '@angular/core';
import { FormArray, FormGroup, FormControl } from '@angular/forms';
import {
  ConfigFormGroup, SelectFormControl, SliderFormControl, InputFormControl, SlideToggleFormControl, ConfigFormGroupArray, HiddenFormControl
} from '@shared-models/config-form';
import { Expression } from 'arlas-api';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { toGeoOptionsObs } from '@services/collection-service/tools';
import { Observable } from 'rxjs';
import { CollectionField } from '@services/collection-service/models';
import { CollectionService } from '@services/collection-service/collection.service';
import { MainFormService } from '@services/main-form/main-form.service';

export class MapGlobalFormGroup extends ConfigFormGroup {
  constructor() {
    super({
      initZoom: new SliderFormControl(
        '',
        marker('Initial zoom'),
        marker('Initial zoom description'),
        1,
        18,
        1,
        null,
        null,
        {
          title: marker('Map initialisation')
        }
      ),
      initCenterLat: new InputFormControl(
        '',
        marker('Init center latitude'),
        marker('Init center latitude description'),
        'number',
        {
          childs: () => [this.customControls.initCenterLon]
        }
      ),
      initCenterLon: new InputFormControl(
        '',
        marker('Init center longitude'),
        marker('Init center longitude description'),
        'number'
      ),
      allowMapExtend: new SlideToggleFormControl(
        '',
        marker('Allow map extend'),
        marker('Allow map extend description'),
      ),
      displayScale: new SlideToggleFormControl(
        '',
        marker('Display scale'),
        marker('Display scale description'),
      ),
      displayCurrentCoordinates: new SlideToggleFormControl(
        '',
        marker('Display coordinates'),
        marker('Display coordinates description'),
      ),
      geographicalOperator: new SelectFormControl(
        null,
        marker('Geographical operator'),
        marker('Geographical operator description'),
        false,
        [
          Expression.OpEnum.Intersects,
          Expression.OpEnum.Notintersects,
          Expression.OpEnum.Notwithin,
          Expression.OpEnum.Within
        ].map(op => ({
          label: op,
          value: op
        })),
        {
          title: marker('Querying data on the map')
        }
      ),
      requestGeometries: new ConfigFormGroupArray([]),
      margePanForLoad: new InputFormControl(
        '',
        marker('MargePanForLoad'),
        marker('MargePanForLoad description'),
        'number',
        {
          title: marker('Advanced')
        }
      ),
      margePanForTest: new InputFormControl(
        '',
        marker('MargePanForTest'),
        marker('MargePanForTest description'),
        'number'
      ),
      unmanagedFields: new FormGroup({
        icon: new FormControl(),
        nbVerticesLimit: new FormControl(),
        mapLayers: new FormGroup({
          events: new FormGroup({
            zoomOnClick: new FormControl(),
            emitOnClick: new FormControl(),
            onHover: new FormControl(),
          })
        })
      })
    });
  }

  public customControls = {
    geographicalOperator: this.get('geographicalOperator') as SelectFormControl,
    requestGeometries: this.get('requestGeometries') as FormArray,
    initZoom: this.get('initZoom') as SliderFormControl,
    initCenterLat: this.get('initCenterLat') as InputFormControl,
    initCenterLon: this.get('initCenterLon') as InputFormControl,
    allowMapExtend: this.get('allowMapExtend') as SlideToggleFormControl,
    displayScale: this.get('displayScale') as SlideToggleFormControl,
    displayCurrentCoordinates: this.get('displayCurrentCoordinates') as SlideToggleFormControl,
    margePanForLoad: this.get('margePanForLoad') as InputFormControl,
    margePanForTest: this.get('margePanForTest') as InputFormControl,
    unmanagedFields: {
      icon: this.get('unmanagedFields.icon'),
      nbVerticesLimit: this.get('unmanagedFields.nbVerticesLimit'),
      mapLayers: {
        events: {
          zoomOnClick: this.get('unmanagedFields.mapLayers.events.zoomOnClick'),
          emitOnClick: this.get('unmanagedFields.mapLayers.events.emitOnClick'),
          onHover: this.get('unmanagedFields.mapLayers.events.onHover'),
        }
      }
    }
  };
}

export class MapGlobalRequestGeometryFormGroup extends ConfigFormGroup {
  constructor(collection: string, geometryPath: string, idPath: string, collectionFields: Observable<Array<CollectionField>>,
  ) {
    super({
      collection: new InputFormControl(
        { value: collection, disabled: true },
        marker('Main collection'),
        ''
      ),
      requestGeom: new SelectFormControl(
        geometryPath,
        marker('Geographical field'),
        marker('Geographical field description'),
        true,
        toGeoOptionsObs(collectionFields),
      ),
      idPath: new HiddenFormControl(
        idPath,
        null,
        {
          onDependencyChange: (control) => {
            control.setValue(idPath);
          },
          optional: false
        }
      )
    });
  }

  public customControls = {
    collection: this.get('collection') as InputFormControl,
    requestGeom: this.get('requestGeom') as SelectFormControl
  };
}

@Injectable({
  providedIn: 'root'
})
export class MapGlobalFormBuilderService {

  constructor(
    private defaultValuesService: DefaultValuesService,
    private mainFormService: MainFormService,
    private collectionService: CollectionService

  ) { }

  public build() {
    const mapGlobalFormGroup = new MapGlobalFormGroup();
    this.defaultValuesService.setDefaultValueRecursively('map.global', mapGlobalFormGroup);
    return mapGlobalFormGroup;
  }

  public buildRequestGeometry(collection: string, geometryPath: string, idPath: string) {
    const collectionFields = this.collectionService.getCollectionFields(
      this.mainFormService.getMainCollection()
    );
    return new MapGlobalRequestGeometryFormGroup(collection, geometryPath, idPath, collectionFields);
  }

}
