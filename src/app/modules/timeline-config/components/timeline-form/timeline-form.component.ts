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
import { Component, OnInit, Input, forwardRef, AfterContentChecked, ChangeDetectorRef } from '@angular/core';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import { TimelineFormComponentForm } from './timeline-form.component.form';
import { NGXLogger } from 'ngx-logger';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { Interval } from 'arlas-api';
import { updateValueAndValidity } from '@utils/tools';
import { ChartType } from 'arlas-web-components';

enum DateFormats {
  English = '%b %d %Y  %H:%M',
  French = '%d %b %Y  %H:%M'
}

@Component({
  selector: 'app-timeline-form',
  templateUrl: './timeline-form.component.html',
  styleUrls: ['./timeline-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimelineFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TimelineFormComponent),
      multi: true
    }
  ]
})
export class TimelineFormComponent extends TimelineFormComponentForm implements OnInit {

  @Input() public dateFields: Array<string> = [];
  @Input() public defaultKey: string;

  public intervalUnits = Array.from(
    new Set(
      Object.values(Interval.UnitEnum).map(v => typeof v === 'string' ? v.toLowerCase() : v)))
    .sort();

  public chartTypes = [ChartType[ChartType.area], ChartType[ChartType.bars]];
  public dateFormats = DateFormats;

  constructor(
    protected formBuilderDefault: FormBuilderWithDefaultService,
    protected logger: NGXLogger
  ) {
    super(formBuilderDefault, logger);
  }

  public ngOnInit() {
    super.ngOnInit();

    this.formFg.controls.isDetailedTimeline.setValue(this.isDetailedTimeline);

    // force update of custom validators & mainForm, otherwise it is not consistent
    this.formFg.valueChanges.subscribe(
      () => updateValueAndValidity(this.formFg, false, false));
  }

}
