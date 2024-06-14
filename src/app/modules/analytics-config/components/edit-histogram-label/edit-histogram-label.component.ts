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
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';
import { MainFormService } from '@services/main-form/main-form.service';

interface LabelConfig {
    title: string;
    dataFieldValue: AbstractControl;
    dataFieldFunction?: AbstractControl;
    labelControl: AbstractControl;
    unitControl: AbstractControl;
    message?: BehaviorSubject<string>;
    readonly?: BehaviorSubject<boolean>;
}

@Component({
  selector: 'arlas-edit-histogram-label',
  templateUrl: './edit-histogram-label.component.html',
  styleUrls: ['./edit-histogram-label.component.scss']
})
export class EditHistogramLabelComponent implements OnInit, OnDestroy {
  public displayedColumns = ['recap', 'fieldLabel', 'fieldColumn', 'fieldUnits'];
    @Input() public dataStep: { aggregation: FormGroup; metric: FormGroup; collection: FormControl;};
    @Input() public unmanagedFieldRenderStep: {
        chartXLabel: FormControl;
        chartYLabel: FormControl;
        xUnit: FormControl;
        yUnit: FormControl;
    };
    @Input() public data: LabelConfig[];

    protected xLabelConfig: LabelConfig;
    protected yLabelConfig: LabelConfig;
    protected lookAndFeelFOrmControl: AbstractControl<any>;
    protected currentCollectionName: string;

    private _destroyed$ = new Subject();

    public constructor(private mainFromService: MainFormService) {
    }

    public ngOnInit(): void {
      if(!this.dataStep && !this.unmanagedFieldRenderStep) {
        console.error('no config found');
        return;
      }

      this.currentCollectionName = this.dataStep.collection.value;

      this.xLabelConfig = {
        title: marker('x-label'),
        dataFieldValue: this.dataStep.aggregation.get('aggregationField'),
        labelControl: this.unmanagedFieldRenderStep.chartXLabel,
        unitControl: this.unmanagedFieldRenderStep.xUnit,
        message: new BehaviorSubject(''),
        readonly: new BehaviorSubject(false)
      };

      this.yLabelConfig =  {
        title: marker('y-label'),
        dataFieldValue: this.dataStep.metric.get('metricCollectField'),
        dataFieldFunction: this.dataStep.metric.get('metricCollectFunction'),
        labelControl: this.unmanagedFieldRenderStep.chartYLabel,
        unitControl: this.unmanagedFieldRenderStep.yUnit,
        message: new BehaviorSubject(''),
        readonly: new BehaviorSubject(false)
      };

      if (this.xFieldIsDate()) {
        this.disableXUnitField();
      }

      if(this.metricCollectionIsCount()) {
        this.disableYUnitField();
        this.setYUnitFieldWithCollectionUnit();
      }

      this.data = [this.xLabelConfig, this.yLabelConfig];
      this.listenChanges();
    }

    private listenChanges() {
      combineLatest([
        this.dataStep.aggregation.get('aggregationFieldType').valueChanges,
        this.xLabelConfig.dataFieldValue.valueChanges
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
        this.yLabelConfig.dataFieldValue.valueChanges,
        this.yLabelConfig.dataFieldFunction.valueChanges
      ])
        .pipe(
          takeUntil(this._destroyed$),
          distinctUntilChanged()
        )
        .subscribe(_ => {
          this.yLabelConfig.labelControl.setValue('');
          this.yLabelConfig.unitControl.setValue('');
          if(this.metricCollectionIsCount()) {
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
          if(this.metricCollectionIsCount()) {
            this.disableYUnitField();
            this.setYUnitFieldWithCollectionUnit();
          }
        });
    }

    private getLookAndFeelControl(){
      if(!this.lookAndFeelFOrmControl || this.currentCollectionName !== this.dataStep.collection.value) {
        this.currentCollectionName = this.dataStep.collection.value;
        const globalFormGroup = this.mainFromService.lookAndFeelConfig.getGlobalFg();
        const lookAndFeelFormControl = (<FormArray>globalFormGroup.customControls.units.value).controls
          .filter(c => c.value.collection ===  this.dataStep.collection.value);
        this.lookAndFeelFOrmControl = lookAndFeelFormControl[0] ?? null;
      }
    }

    private xFieldIsDate() {
      return this.dataStep.aggregation.get('aggregationFieldType').value === 'time';
    }

    private metricCollectionIsCount() {
      return this.yLabelConfig.dataFieldFunction.value === 'Count';
    }

    private disableXUnitField() {
      this.xLabelConfig.readonly.next(true);
      this.xLabelConfig.unitControl.setValue('');
      this.xLabelConfig.message.next('Managed by Arlas');
    }

    private disableYUnitField (){
      this.yLabelConfig.readonly.next(true);
      this.yLabelConfig.message.next('Field set by unit collection in look and feel');
    }

    private setYUnitFieldWithCollectionUnit(){
      this.getLookAndFeelControl();
      const collectionUnit =(this.lookAndFeelFOrmControl) ? this.lookAndFeelFOrmControl?.value.unit : '';
      this.yLabelConfig.unitControl.setValue(collectionUnit);
    }

    private enableXUnitField(value?: string) {
      this.xLabelConfig.readonly.next(false);
      if (value) {
        this.unmanagedFieldRenderStep.xUnit.setValue(marker(value));
      } else {
        this.unmanagedFieldRenderStep.xUnit.setValue('');
      }
    }

    private enableYUnitField(value?: string) {
      this.yLabelConfig.readonly.next(false);
      if (value) {
        this.unmanagedFieldRenderStep.yUnit.setValue(marker(value));
      } else {
        this.unmanagedFieldRenderStep.yUnit.setValue('');
      }
    }


    public ngOnDestroy() {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }

}
