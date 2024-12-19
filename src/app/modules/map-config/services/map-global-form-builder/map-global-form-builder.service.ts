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
import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { marker } from '@colsen1991/ngx-translate-extract-marker';
import { CollectionService } from '@services/collection-service/collection.service';
import { CollectionField } from '@services/collection-service/models';
import { toGeoOptionsObs } from '@services/collection-service/tools';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { MainFormService } from '@services/main-form/main-form.service';
import {
  ConfigFormGroup, ConfigFormGroupArray, HiddenFormControl, InputFormControl, SelectFormControl, SliderFormControl, SlideToggleFormControl
} from '@shared-models/config-form';
import { Expression } from 'arlas-api';
import { Observable, of } from 'rxjs';

export interface GeoFilter {
  geoOp: string | Expression.OpEnum;
  geoField: string;
};

export class MapGlobalFormGroup extends ConfigFormGroup {
  public collectionGeoFiltersMap: Map<string, GeoFilter> = new Map();
  public constructor() {
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
      requestGeometries: (new ConfigFormGroupArray([]))
        .addTitle(marker('Querying data on the map'))
        .addDescription(marker('geofilters description'))
        .addNote(marker('list of geofilters'))
        .addEmptylistNote(marker('no geofilter')),
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

  public updateGeoFiltersMap() {
    this.collectionGeoFiltersMap = this.getCurrentGeoFilters();
  }

  public getGeoFilter(collection: string): MapGlobalRequestGeometryFormGroup {
    const currentGeoFiltersMap = this.getCurrentGeoFilters();
    const collectionExist = currentGeoFiltersMap.has(collection);
    if (collectionExist) {
      const collectionsList: string[] = this.customControls.requestGeometries.getRawValue().map(r => r.collection);
      const index = (collectionsList.sort()).indexOf(collection);
      const geoFilterToReturn: MapGlobalRequestGeometryFormGroup =
        (this.customControls.requestGeometries.at(index) as MapGlobalRequestGeometryFormGroup);
      this.collectionGeoFiltersMap.set(collection, {
        geoField: geoFilterToReturn.customControls.requestGeom.value,
        geoOp: geoFilterToReturn.customControls.geographicalOperator.value
      });
      return geoFilterToReturn;
    }
    return undefined;
  }
  public addGeoFilter(collection, requestGeometryFg: MapGlobalRequestGeometryFormGroup): void {
    const currentGeoFiltersMap = this.getCurrentGeoFilters();
    const collectionExist = currentGeoFiltersMap.has(collection);
    if (!collectionExist) {
      const cachedGeoFilter = this.collectionGeoFiltersMap.get(collection);
      if (cachedGeoFilter) {
        requestGeometryFg.customControls.geographicalOperator.setValue(cachedGeoFilter.geoOp);
        requestGeometryFg.customControls.requestGeom.setValue(cachedGeoFilter.geoField);
      } else {
        this.collectionGeoFiltersMap.set(collection, {
          geoField: requestGeometryFg.customControls.requestGeom.value,
          geoOp: requestGeometryFg.customControls.geographicalOperator.value
        });
      }
      /** insert geofilter according to collection alphabetical order */
      const collectionsSet: Set<string>= new Set(this.customControls.requestGeometries.getRawValue().map(r => r.collection));
      collectionsSet.add(collection);
      const index = (Array.from(collectionsSet).sort()).indexOf(collection);
      this.customControls.requestGeometries.insert(index, requestGeometryFg);
    }
  }

  public removeGeofilter(collection): void {
    const currentGeoFiltersMap = this.getCurrentGeoFilters();
    const collectionExist = currentGeoFiltersMap.has(collection);
    if (collectionExist) {
      const collectionsList: string[] = this.customControls.requestGeometries.getRawValue().map(r => r.collection);
      const index = (collectionsList.sort()).indexOf(collection);
      const geoFilterToRemove: MapGlobalRequestGeometryFormGroup =
        (this.customControls.requestGeometries.at(index) as MapGlobalRequestGeometryFormGroup);
      this.collectionGeoFiltersMap.set(collection, {
        geoField: geoFilterToRemove.customControls.requestGeom.value,
        geoOp: geoFilterToRemove.customControls.geographicalOperator.value
      });
      this.customControls.requestGeometries.removeAt(index);
    }
  }

  private getCurrentGeoFilters() {
    const currentGeoFilters = this.customControls.requestGeometries.getRawValue();
    const currentGeoFiltersMap = new Map<string, GeoFilter>();
    currentGeoFilters.forEach(gf => {
      currentGeoFiltersMap.set(gf.collection, {
        geoField: gf.requestGeom,
        geoOp: gf.geographicalOperator,
      });
    });
    return currentGeoFiltersMap;
  }
}

export class MapGlobalRequestGeometryFormGroup extends ConfigFormGroup {
  public constructor(
    collection: string,
    geometryPath: string,
    geoOp: Expression.OpEnum | string,
    collectionFields: Observable<Array<CollectionField>>,
    collectionService: CollectionService
  ) {
    super({
      collection: new SelectFormControl(
        collection,
        marker('Collection'),
        undefined,
        false,
        [],
        {
          optional: false,
          resetDependantsOnChange: true,
          isCollectionSelect: true
        },
        collectionService.getGroupCollectionItemsWithCentroid()
      ),
      geographicalOperator: new SelectFormControl(
        geoOp,
        marker('Geographical operator'),
        undefined,
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
      requestGeom: new SelectFormControl(
        geometryPath,
        marker('Geographical field'),
        undefined,
        true,
        toGeoOptionsObs(collectionFields),
      )
    });
    this.customControls.collection.disable();
  }

  public customControls = {
    collection: this.get('collection') as SelectFormControl,
    requestGeom: this.get('requestGeom') as SelectFormControl,
    geographicalOperator: this.get('geographicalOperator') as SelectFormControl
  };
}

@Injectable({
  providedIn: 'root'
})
export class MapGlobalFormBuilderService {


  public constructor(
    private defaultValuesService: DefaultValuesService,
    private collectionService: CollectionService
  ) { }

  public build() {
    const mapGlobalFormGroup = new MapGlobalFormGroup();
    this.defaultValuesService.setDefaultValueRecursively('map.global', mapGlobalFormGroup);
    return mapGlobalFormGroup;
  }

  public buildRequestGeometry(collection: string, geometryPath: string, geoOp: Expression.OpEnum | string) {
    if (!geometryPath) {
      collection = undefined;
    }
    let collectionFields = of([]);
    if (!!collection) {
      collectionFields = this.collectionService.getCollectionFields(
        collection
      );
    }
    return new MapGlobalRequestGeometryFormGroup(collection, geometryPath, geoOp, collectionFields, this.collectionService);
  }

}
