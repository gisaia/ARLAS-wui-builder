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

import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ConfigFormGroupComponent } from '../config-form-group/config-form-group.component';
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'arlas-histogram-bucket-form-group',
  templateUrl: './histogram-bucket-form-group.component.html',
  styleUrls: ['./histogram-bucket-form-group.component.scss'],

  encapsulation: ViewEncapsulation.None
})
export class HistogramBucketFormGroupComponent extends ConfigFormGroupComponent implements OnInit, OnDestroy {


  public aggregationFieldControl;
  public aggregationFieldTypeControl;
  public bucketTypeControl;
  public preferredBucketsNumber;
  public preferredIntervalSize;
  public preferredIntervalUnit;

  protected readonly WARNING_MESSAGE = marker('Warning, changing this field\'s value will reset some other fields');

  public ngOnInit(): void {
    super.ngOnInit();
    this.isSubGroup = true;
    this.aggregationFieldControl = this.configFormGroup.controls.aggregationField;
    this.aggregationFieldTypeControl = this.configFormGroup.controls.aggregationFieldType;
    this.bucketTypeControl = this.configFormGroup.controls.aggregationBucketOrInterval;
    this.preferredBucketsNumber = this.configFormGroup.controls.aggregationBucketsNumber;
    this.preferredIntervalSize = this.configFormGroup.controls.aggregationIntervalSize;
    this.preferredIntervalUnit = this.configFormGroup.controls.aggregationIntervalUnit;
  }

}
