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
import { AfterViewInit, Component, forwardRef, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import { PROPERTY_SELECTOR_SOURCE } from '@shared-components/property-selector/models';
import { NGXLogger } from 'ngx-logger';
import { AGGREGATE_GEOMETRY_TYPE, CLUSTER_GEOMETRY_TYPE, GRANULARITY } from '../edit-layer-mode-form/models';
import { EditLayerClusterComponentForm } from './edit-layer-cluster.component.form';
import { GEOMETRY_TYPE } from '@map-config/components/edit-layer-mode-form/models';
import { EditLayerModeFormComponent } from '../edit-layer-mode-form/edit-layer-mode-form.component';
import { MapLayerFormBuilderService } from '@map-config/services/map-layer-form-builder/map-layer-form-builder.service';



@Component({
  selector: 'app-edit-layer-cluster',
  templateUrl: './edit-layer-cluster.component.html',
  styleUrls: ['./edit-layer-cluster.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditLayerClusterComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => EditLayerClusterComponent),
      multi: true
    }
  ]
})
export class EditLayerClusterComponent extends EditLayerClusterComponentForm implements OnInit, AfterViewInit {

  @ViewChild(EditLayerModeFormComponent, { static: true })
  public embeddedFeaturesComponent: EditLayerModeFormComponent;

  public PROPERTY_SELECTOR_SOURCE = PROPERTY_SELECTOR_SOURCE;
  public GRANULARITY = GRANULARITY;
  public CLUSTER_GEOMETRY_TYPE = CLUSTER_GEOMETRY_TYPE;
  public AGGREGATE_GEOMETRY_TYPE = AGGREGATE_GEOMETRY_TYPE;
  public GEOMETRY_TYPE = GEOMETRY_TYPE;

  public sorts: Set<string> = new Set();

  constructor(
    protected logger: NGXLogger,
    protected mapLayerFormBuilder: MapLayerFormBuilderService,
    protected changeDetectorRef: ChangeDetectorRef
  ) {
    super(logger);
    this.formFg = mapLayerFormBuilder.buildCluster();
  }

  public ngOnInit() {
    super.ngOnInit();

    // by getting a reference to the embedded form in this variable,
    // it will used by the parent ControlValueAccessor implementation to write values on-the-fly
    this.embeddedFeaturesComponent.formFg = this.formFg;
  }

  public ngAfterViewInit() {
    this.initSortChips();
    // Fired geometryChange event to update colorFgSource according to the geometryType value at init
    this.geometryTypeChange(this.geometryType.value);
  }

  public getGeoPointFields() {
    return this.embeddedFeaturesComponent.collectionGeoPointFields;
  }

  public getGeoFields() {
    return this.embeddedFeaturesComponent.collectionGeoFields;
  }

  public getAllButGeoFields() {
    return this.embeddedFeaturesComponent.collectionAllButGeoFields;
  }

  public addSort(sort: string, event) {
    event.stopPropagation();
    this.sorts.add(sort);
    this.setSortValue();
  }

  public removeSort(sort: string) {
    this.sorts.delete(sort);
    this.setSortValue();
  }

  public geometryTypeChange(geometryType: string) {
    if (geometryType === GEOMETRY_TYPE.heatmap) {
      this.colorFgSources = [PROPERTY_SELECTOR_SOURCE.heatmap_density];
    } else {
      this.colorFgSources = [
        PROPERTY_SELECTOR_SOURCE.fix,
        PROPERTY_SELECTOR_SOURCE.interpolated
      ];
    }
    this.changeDetectorRef.detectChanges();
  }

  private setSortValue() {
    const sortValue = Array.from(this.sorts).reduce((a, b) => a + ',' + b);
    this.clusterSort.setValue(sortValue);
  }

  private initSortChips() {
    if (!!this.clusterSort.value) {
      this.clusterSort.value.split(',').forEach(sortTerm => {
        this.sorts.add(sortTerm);
      });
    }
  }

}
