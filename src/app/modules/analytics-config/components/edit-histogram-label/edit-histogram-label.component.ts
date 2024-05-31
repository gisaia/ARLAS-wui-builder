import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from "@angular/forms";
import { ConfigFormGroup } from "@shared-models/config-form";
import { marker } from "@biesbjerg/ngx-translate-extract-marker";

interface LabelConfig {
  title: string;
  dataFieldValue: AbstractControl;
  dataFieldFunction?: AbstractControl;
  labelControl: AbstractControl
  unitControl: AbstractControl;
}

@Component({
  selector: 'app-edit-histogram-label',
  templateUrl: './edit-histogram-label.component.html',
  styleUrls: ['./edit-histogram-label.component.scss']
})
export class EditHistogramLabelComponent implements OnInit {
  public displayedColumns = ['recap', 'fieldLabel', 'fieldColumn', 'fieldUnits'];
  @Input() public dataStep: {aggregation: FormGroup, metric: FormGroup};
  @Input() public unmanagedFieldRenderStep: {chartXLabel: FormControl,chartYLabel:FormControl, xUnit:FormControl, yUnit: FormControl };
  @Input() public data: LabelConfig[];
  constructor() { }

  ngOnInit(): void {
    const xLabel = {
      title: marker('x-label'),
      dataFieldValue: this.dataStep.aggregation.get('aggregationField'),
      labelControl: this.unmanagedFieldRenderStep.chartXLabel,
      unitControl: this.unmanagedFieldRenderStep.xUnit
    };
    const yLabel = {
      title: marker('y-label'),
      dataFieldValue: this.dataStep.metric.get('metricCollectField'),
      dataFieldFunction: this.dataStep.metric.get('metricCollectFunction'),
      labelControl: this.unmanagedFieldRenderStep.chartYLabel,
      unitControl: this.unmanagedFieldRenderStep.yUnit
    };
    this.data = [xLabel, yLabel];
  }

}
