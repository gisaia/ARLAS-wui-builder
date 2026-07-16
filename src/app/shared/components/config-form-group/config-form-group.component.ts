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
import { BucketsIntervalFormGroup } from '@analytics-config/services/buckets-interval-form-builder/buckets-interval-form-builder.service';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import {
  Component, OnDestroy, OnInit, QueryList, ViewChild,
  ViewChildren, ViewEncapsulation, forwardRef
} from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslatePipe } from '@ngx-translate/core';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';
import { ConfigFormControlComponent } from '@shared-components/config-form-control/config-form-control.component';
import { ConfigFormGroupArrayComponent } from '@shared-components/config-form-group-array/config-form-group-array.component';
import { HistogramBucketFormGroupComponent } from '@shared-components/histogram-bucket-form-group/histogram-bucket-form-group.component';
import {
  ConfigFormControl,
  ConfigFormGroup,
  ConfigFormGroupArray,
  HiddenConfigFromGroup,
  HiddenFormControl
} from '@shared-models/config-form';
import { ObjectvaluesPipe } from '@shared/pipes/objectvalues.pipe';
import { OrderConfigFormTabControlsPipe } from '@shared/pipes/order-config-form-tab.pipe';
import { Subscription } from 'rxjs';
import { UpperFirstPipe } from '../../pipes/upper-first.pipe';
import { AsbtractConfigFormControl } from './abstract-config-form-group';

/**
 * TODO this class can probably be optimized.
 * For example, when we process control.dependsOn() to subscribe to value changes,
 * this may be grouped into a sigle listener if multiple controls depend on a same one.
 */
@Component({
  selector: 'arlas-config-form-group',
  templateUrl: './config-form-group.component.html',
  styleUrls: ['./config-form-group.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true }
    }
  ],
  encapsulation: ViewEncapsulation.None,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    MatStepperModule,
    ObjectvaluesPipe,
    MatTabsModule,
    OrderConfigFormTabControlsPipe,
    MatButtonModule,
    forwardRef(() => ConfigElementComponent),
    forwardRef(() => ConfigFormControlComponent),
    forwardRef(() => HistogramBucketFormGroupComponent),
    forwardRef(() => ConfigFormGroupArrayComponent),
    UpperFirstPipe
]
})
export class ConfigFormGroupComponent extends AsbtractConfigFormControl implements OnInit, OnDestroy {
  @ViewChild(MatStepper, { static: false }) private stepper: MatStepper;
  @ViewChildren(forwardRef(() => ConfigFormGroupComponent)) private subConfigFormGroups: QueryList<ConfigFormGroupComponent>;

  public static listenToAllControlsOnDependencyChange(configFormGroup: ConfigFormGroup, toUnsubscribe: Array<Subscription>) {
    [
      ...configFormGroup.controlsRecursively,
      configFormGroup
    ]
      .filter(c => c instanceof ConfigFormGroup || c instanceof ConfigFormControl)
      .forEach((c: ConfigFormGroup | ConfigFormControl) => {
        ConfigFormGroupComponent.listenToOnDependencysChange(c, toUnsubscribe);
      });
  }

  /**
   * Watch all other controls that input control depends on to update itself
   */
  public static listenToOnDependencysChange(control: ConfigFormControl | ConfigFormGroup, toUnsubscribe: Array<Subscription>) {
    if (!!control.dependsOn) {
      control.dependsOn().forEach(dep => {
        toUnsubscribe.push(dep.valueChanges.subscribe(v => {
          control.onDependencyChange(control);
        }));
      });
      // trigger on initial load for each control to be on its expected state against other controls
      control.onDependencyChange(control, true);
    }
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
    this.stepper = null;
    this.subConfigFormGroups = null;
  }

  public isFormControl(control: AbstractControl): ConfigFormControl | null {
    return control instanceof ConfigFormControl && !(control instanceof HiddenFormControl) ? control : null;
  }

  public isFormGroup(control: AbstractControl): ConfigFormGroup | null {
    return !this.isHistogramBucketFormGroup(control) && control instanceof ConfigFormGroup &&
    !(control instanceof HiddenConfigFromGroup) ? control : null;
  }

  public isHistogramBucketFormGroup(control: AbstractControl): BucketsIntervalFormGroup | null {
    return control instanceof BucketsIntervalFormGroup ? control : null;
  }

  public isFormGroupArray(control: AbstractControl): ConfigFormGroupArray | null {
    return control instanceof ConfigFormGroupArray ? control : null;
  }

  public hasChildSteps = () => Object.values(this.configFormGroup.controls)
    .filter(c => (c instanceof ConfigFormGroup && !!c.stepName))
    .length > 0;

  public hasChildTabs = () => Object.values(this.configFormGroup.controls)
    .filter(c => (c instanceof ConfigFormGroup && !!c.tabName))
    .length > 0;

  /**
   * Propagate the submission to sub config form groups
   * Usefull to update the stepper's state (if there is any)
   */
  public submit() {
    this.subConfigFormGroups.forEach(s => s.submit());
    if (!!this.stepper) {
      this.stepper.steps.setDirty();
      this.stepper.steps.forEach(s => s.interacted = true);
    }
  }

}
