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

import { NgClass } from '@angular/common';
import { Component, forwardRef, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { marker } from '@colsen1991/ngx-translate-extract-marker';
import { TranslatePipe } from '@ngx-translate/core';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';
import { ConfigFormControlComponent } from '@shared-components/config-form-control/config-form-control.component';
import { AsbtractConfigFormControl } from '@shared-components/config-form-group/abstract-config-form-group';
import { AlertOnChangeDirective } from '@shared-directives/alert-on-change/alert-on-change.directive';
import { ResetOnChangeDirective } from '@shared-directives/reset-on-change/reset-on-change.directive';

@Component({
  selector: 'arlas-histogram-bucket-form-group',
  templateUrl: './histogram-bucket-form-group.component.html',
  styleUrls: ['./histogram-bucket-form-group.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    TranslatePipe,
    forwardRef(() => ConfigElementComponent),
    forwardRef(() => ConfigFormControlComponent),
    MatRadioModule,
    ResetOnChangeDirective,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSliderModule,
    AlertOnChangeDirective,
    MatSelectModule,
    MatTooltipModule,
    NgClass
  ]
})
export class HistogramBucketFormGroupComponent extends AsbtractConfigFormControl implements OnInit, OnDestroy {
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
