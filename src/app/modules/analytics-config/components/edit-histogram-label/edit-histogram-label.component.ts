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
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { combineLatest, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

interface LabelConfig {
    title: string;
    dataFieldValue: AbstractControl;
    dataFieldFunction?: AbstractControl;
    labelControl: AbstractControl;
    unitControl: AbstractControl;
}

@Component({
  selector: 'arlas-edit-histogram-label',
  templateUrl: './edit-histogram-label.component.html',
  styleUrls: ['./edit-histogram-label.component.scss']
})
export class EditHistogramLabelComponent implements OnInit, OnDestroy {
  public displayedColumns = ['recap', 'fieldLabel', 'fieldColumn', 'fieldUnits'];
    @Input() public dataStep: { aggregation: FormGroup; metric: FormGroup; };
    @Input() public unmanagedFieldRenderStep: {
        chartXLabel: FormControl;
        chartYLabel: FormControl;
        xUnit: FormControl;
        yUnit: FormControl;
    };
    @Input() public data: LabelConfig[];

    private _destroyed$ = new Subject();

    public constructor(private translateService: TranslateService) {
    }

    public ngOnInit(): void {
      if(!this.dataStep && !this.unmanagedFieldRenderStep) {
        console.error('no config found');
        return;
      }
      if (this.xFieldIsDate()) {
        this.disableXUnitField();
      }

      const xLabel: LabelConfig = {
        title: marker('x-label'),
        dataFieldValue: this.dataStep.aggregation.get('aggregationField'),
        labelControl: this.unmanagedFieldRenderStep.chartXLabel,
        unitControl: this.unmanagedFieldRenderStep.xUnit
      };
      const yLabel: LabelConfig = {
        title: marker('y-label'),
        dataFieldValue: this.dataStep.metric.get('metricCollectField'),
        dataFieldFunction: this.dataStep.metric.get('metricCollectFunction'),
        labelControl: this.unmanagedFieldRenderStep.chartYLabel,
        unitControl: this.unmanagedFieldRenderStep.yUnit
      };
      this.data = [xLabel, yLabel];
      this.listenChanges();
    }

    private listenChanges() {
      combineLatest([
        this.dataStep.aggregation.get('aggregationFieldType').valueChanges,
        this.dataStep.aggregation.get('aggregationField').valueChanges
      ])
        .pipe(
          takeUntil(this._destroyed$),
          distinctUntilChanged())
        .subscribe(_ => {
          this.unmanagedFieldRenderStep.chartXLabel.setValue('');
          if (this.xFieldIsDate()) {
            this.disableXUnitField();
          } else {
            this.enableXUnitField();
          }
        });
      combineLatest([
        this.dataStep.metric.get('metricCollectField').valueChanges,
        this.dataStep.metric.get('metricCollectFunction').valueChanges]
      )
        .pipe(
          takeUntil(this._destroyed$),
          distinctUntilChanged()
        )
        .subscribe(_ => {
          this.unmanagedFieldRenderStep.chartYLabel.setValue('');
          this.unmanagedFieldRenderStep.yUnit.setValue('');
        });
    }

    private xFieldIsDate() {
      return this.dataStep.aggregation.get('aggregationFieldType').value === 'time';
    }

    private disableXUnitField() {
      this.unmanagedFieldRenderStep.xUnit.disable();
      this.unmanagedFieldRenderStep.xUnit.setValue(this.translateService.instant('At export'));
    }

    private enableXUnitField(value?: string) {
      this.unmanagedFieldRenderStep.xUnit.enable();
      if (value) {
        this.unmanagedFieldRenderStep.xUnit.setValue(marker(value));
      } else {
        this.unmanagedFieldRenderStep.xUnit.setValue('');
      }
    }

    public ngOnDestroy() {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }

}
