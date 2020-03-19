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
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, FormBuilder } from '@angular/forms';
import { NGXLogger } from 'ngx-logger';
import { EditLayerFeatureMetricComponentForm } from './edit-layer-feature-metric.component.form';

@Component({
  selector: 'app-edit-layer-feature-metric',
  templateUrl: './edit-layer-feature-metric.component.html',
  styleUrls: ['./edit-layer-feature-metric.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditLayerFeatureMetricComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => EditLayerFeatureMetricComponent),
      multi: true
    }
  ]
})
export class EditLayerFeatureMetricComponent extends EditLayerFeatureMetricComponentForm implements OnInit {

  constructor(
    protected logger: NGXLogger,
    protected formBuilder: FormBuilder
  ) {
    super(logger, formBuilder);
  }

  public ngOnInit() {

    super.ngOnInit();

    // by getting a reference to the embedded form in this variable,
    // it will used by the parent ControlValueAccessor implementation to write values on-the-fly
    this.formFg = this.embeddedFeaturesComponent.formFg;
    this.registerGeometryId();
  }

  public getKeywordFields() {
    return this.embeddedFeaturesComponent.collectionKeywordFields;
  }

}