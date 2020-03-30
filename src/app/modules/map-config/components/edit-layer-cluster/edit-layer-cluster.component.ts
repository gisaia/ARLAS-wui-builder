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
import { Component, OnInit, forwardRef } from '@angular/core';
import { EditLayerClusterComponentForm } from './edit-layer-cluster.component.form';
import { NGXLogger } from 'ngx-logger';
import { FormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PROPERTY_SELECTOR_SOURCE } from '@shared-components/property-selector/models';
import { GRANULARITY, AGGREGATE_GEOMETRY_TYPE, CLUSTER_GEOMETRY_TYPE } from '../edit-layer-mode-form/models';



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
export class EditLayerClusterComponent extends EditLayerClusterComponentForm implements OnInit {

  public PROPERTY_SELECTOR_SOURCE = PROPERTY_SELECTOR_SOURCE;
  public GRANULARITY = GRANULARITY;
  public CLUSTER_GEOMETRY_TYPE = CLUSTER_GEOMETRY_TYPE;
  public AGGREGATE_GEOMETRY_TYPE = AGGREGATE_GEOMETRY_TYPE;

  constructor(
    protected logger: NGXLogger,
    protected formBuilder: FormBuilder
  ) {
    super(logger, formBuilder);
  }

  ngOnInit() {
    super.ngOnInit();

    // by getting a reference to the embedded form in this variable,
    // it will used by the parent ControlValueAccessor implementation to write values on-the-fly
    this.formFg = this.embeddedFeaturesComponent.formFg;
    this.registerAggGeometry();
    this.registerGranlularity();
    this.registerClusterGeometryType();
    this.registerAggregatedGeometry();
    this.registerRawGeometry();
  }

  public getGeoPointFields() {
    return this.embeddedFeaturesComponent.collectionGeoPointFields;
  }

  public getGeoFields() {
    return this.embeddedFeaturesComponent.collectionGeoFields;
  }

}
