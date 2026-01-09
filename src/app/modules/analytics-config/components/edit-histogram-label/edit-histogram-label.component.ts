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
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { marker } from '@colsen1991/ngx-translate-extract-marker';
import { MainFormService } from '@services/main-form/main-form.service';
import { BehaviorSubject, combineLatest, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

interface LabelConfig {
    title: string;
    dataFieldValue: AbstractControl;
    dataFieldFunction?: AbstractControl;
    labelControl: AbstractControl;
    unitControl: AbstractControl;
    infoMessage?: BehaviorSubject<string>;
    hint?: BehaviorSubject<string>;
    displayUnitControl?: BehaviorSubject<boolean>;
}

@Component({
    selector: 'arlas-edit-histogram-label',
    templateUrl: './edit-histogram-label.component.html',
    styleUrls: ['./edit-histogram-label.component.scss'],
    standalone: false
})
export class EditHistogramLabelComponent implements OnInit, OnDestroy {
    /**
     * field from parent form control
     */
    @Input() public dataStep: { aggregation: FormGroup; metric: FormGroup; collection: FormControl; };
    /**
     * field from parent form control
     */
    @Input() public unmanagedFieldRenderStep: {
        chartXLabel: FormControl;
        chartYLabel: FormControl;
        xUnit: FormControl;
        yUnit: FormControl;
    };
    @Input() public data: LabelConfig[];
    public displayedColumns = ['recap', 'fieldLabel', 'fieldColumn', 'fieldUnits'];
    /**
     *  X axis config
     * @protected
     */
    protected xAxisConfig: LabelConfig;
    /**
     *  Y axis config
     * @protected
     */
    protected yAxisConfig: LabelConfig;
    /**
     * Get lookAndField value to listen collection unit change
     * @protected
     */
    protected lookAndFeelFormControl: AbstractControl<any>;
    /**
     * Comparing value
     * @protected
     */
    protected currentCollectionName: string;

    private _destroyed$ = new Subject();

    public constructor(private mainFromService: MainFormService) {
    }

    public ngOnInit(): void {
      if (!this.dataStep && !this.unmanagedFieldRenderStep) {
        console.error('no config found');
        return;
      }

      this.currentCollectionName = this.dataStep.collection.value;

      this.xAxisConfig = {
        title: marker('x-Axis'),
        dataFieldValue: this.dataStep.aggregation.get('aggregationField'),
        labelControl: this.unmanagedFieldRenderStep.chartXLabel,
        unitControl: this.unmanagedFieldRenderStep.xUnit,
        hint: new BehaviorSubject(''),
        infoMessage: new BehaviorSubject(''),
        displayUnitControl: new BehaviorSubject(true)
      };

      this.yAxisConfig = {
        title: marker('y-Axis'),
        dataFieldValue: this.dataStep.metric.get('metricCollectField'),
        dataFieldFunction: this.dataStep.metric.get('metricCollectFunction'),
        labelControl: this.unmanagedFieldRenderStep.chartYLabel,
        unitControl: this.unmanagedFieldRenderStep.yUnit,
        hint: new BehaviorSubject(''),
        infoMessage: new BehaviorSubject(''),
        displayUnitControl: new BehaviorSubject(true)
      };

      if (this.xFieldIsDate()) {
        this.disableXUnitField();
      }

      if (this.metricCollectionIsCount()) {
        this.disableYUnitField();
        this.setYUnitFieldWithCollectionUnit();
      }

      this.data = [this.xAxisConfig, this.yAxisConfig];
      this.listenChanges();
    }

    /**
     *  Listen change from data view to reset, or disable fields
     * @private
     */
    private listenChanges() {
      combineLatest([
        this.dataStep.aggregation.get('aggregationFieldType').valueChanges,
        this.xAxisConfig.dataFieldValue.valueChanges
      ])
        .pipe(
          takeUntil(this._destroyed$),
          distinctUntilChanged())
        .subscribe(_ => {
          this.resetXAxisConfig();
          if (this.xFieldIsDate()) {
            this.disableXUnitField();
          } else {
            this.enableXUnitField();
          }
        });
      combineLatest([
        this.yAxisConfig.dataFieldValue.valueChanges,
        this.yAxisConfig.dataFieldFunction.valueChanges
      ])
        .pipe(
          takeUntil(this._destroyed$),
          distinctUntilChanged()
        )
        .subscribe(_ => {
          this.resetYAxisConfig();
          if (this.metricCollectionIsCount()) {
            this.disableYUnitField();
            this.setYUnitFieldWithCollectionUnit();
          } else {
            this.enableYUnitField();
          }
        });

      this.dataStep.collection.valueChanges
        .pipe(
          takeUntil(this._destroyed$),
          distinctUntilChanged()
        ).subscribe(value => {
          if (this.metricCollectionIsCount()) {
            this.resetYAxisConfig();
            this.disableYUnitField();
            this.setYUnitFieldWithCollectionUnit();
          }
        });
    }

    private getLookAndFeelControl() {
      if (!this.lookAndFeelFormControl || this.currentCollectionName !== this.dataStep.collection.value) {
        this.currentCollectionName = this.dataStep.collection.value;
        const globalFormGroup = this.mainFromService.lookAndFeelConfig.getGlobalFg();
        const lookAndFeelFormControl = (<FormArray>globalFormGroup.customControls.units.value).controls
          .filter(c => c.value.collection === this.dataStep.collection.value);
        this.lookAndFeelFormControl = lookAndFeelFormControl[0] ?? null;
      }
    }

    private xFieldIsDate() {
      return this.dataStep.aggregation.get('aggregationFieldType').value === 'time';
    }

    private metricCollectionIsCount() {
      return this.yAxisConfig.dataFieldFunction.value === 'Count';
    }

    private disableXUnitField() {
      this.xAxisConfig.displayUnitControl.next(false);
      this.xAxisConfig.unitControl.disable();
      this.xAxisConfig.hint.next(marker('Managed by ARLAS'));
      this.xAxisConfig.infoMessage.next(marker('Filled by ARLAS'));
    }

    private enableXUnitField() {
      this.xAxisConfig?.unitControl.enable();
    }

    private disableYUnitField() {
      this.yAxisConfig.unitControl.disable();
      this.yAxisConfig.infoMessage.next(marker('Field set by unit collection in look and feel'));
    }

    private enableYUnitField() {
      this.yAxisConfig?.unitControl.enable();
    }

    private setYUnitFieldWithCollectionUnit() {
      this.getLookAndFeelControl();
      const collectionUnit = this.lookAndFeelFormControl?.value.unit ?? this.dataStep.collection.value;
      this.yAxisConfig.unitControl.setValue(collectionUnit);
    }

    private resetXAxisConfig(value?: string) {
      this.xAxisConfig.displayUnitControl.next(true);
      this.xAxisConfig.labelControl.setValue('');
      this.xAxisConfig.infoMessage.next('');
      this.xAxisConfig.hint.next('');
      if (value) {
        this.xAxisConfig.unitControl.setValue(value);
      } else {
        this.xAxisConfig.unitControl.setValue('');
      }
    }

    private resetYAxisConfig(value?: string) {
      this.yAxisConfig.displayUnitControl.next(true);
      this.yAxisConfig.labelControl.setValue('');
      this.yAxisConfig.infoMessage.next('');
      this.yAxisConfig.hint.next('');
      if (value) {
        this.yAxisConfig.unitControl.setValue(value);
      } else {
        this.yAxisConfig.unitControl.setValue('');
      }
    }

    public ngOnDestroy() {
      // enabled just before to allow parent input retrieve data
      // cause disabled input are discarded.
      this.enableYUnitField();
      this.enableXUnitField();
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }

}
