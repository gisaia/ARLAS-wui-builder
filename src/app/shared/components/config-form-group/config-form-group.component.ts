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
import {
  Component, OnInit, Input, OnDestroy, ViewChild, ViewChildren, ViewEncapsulation, QueryList, ChangeDetectorRef
} from '@angular/core';
import { ConfigFormGroup, ConfigFormControl, ConfigFormGroupArray } from '@shared-models/config-form';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { MatStepper } from '@angular/material';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { AbstractControl } from '@angular/forms';

/**
 * TODO this class can probably be optimized.
 * For example, when we process control.dependsOn() to subscribe to value changes,
 * this may be grouped into a sigle listener if multiple controls depend on a same one.
 */
@Component({
  selector: 'app-config-form-group',
  templateUrl: './config-form-group.component.html',
  styleUrls: ['./config-form-group.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true }
    }
  ],
  encapsulation: ViewEncapsulation.None
})
export class ConfigFormGroupComponent implements OnInit, OnDestroy {

  @Input() public configFormGroup: ConfigFormGroup;
  @Input() public isSubGroup: boolean;
  @Input() public defaultKey: string;
  @ViewChild(MatStepper, { static: false }) private stepper: MatStepper;
  @ViewChildren(ConfigFormGroupComponent) private subConfigFormGroups: QueryList<ConfigFormGroupComponent>;

  public toUnsubscribe: Array<Subscription> = [];

  constructor(
    private sanitizer: DomSanitizer,
  ) { }

  public ngOnInit() {

    /**
     * The root ConfigFormGroup is responsible of all its sub-controls.
     * At loading, it browses all the sub-controls to manage there state.
     * At first, we didn't have a notion or root / subgroup, we just used
     * to initialize the sub-controls of a group when displaying it; however
     * some field in a not-displayed (ia not initialized) subgroup may
     * depend on a displayed field, this was not managed.
     */
    if (!this.isSubGroup) {
      this.listenToAllControlsOnDependencyChange();
      this.initDependentControls();
      this.markChildControls();
    }
  }

  public ngOnDestroy(): void {
    this.toUnsubscribe.forEach(u => u.unsubscribe());
  }



  private listenToAllControlsOnDependencyChange() {
    [
      ...this.configFormGroup.controlsRecursively,
      this.configFormGroup
    ]
      .filter(c => c instanceof ConfigFormGroup || c instanceof ConfigFormControl)
      .forEach((c: ConfigFormGroup | ConfigFormControl) => {
        this.listenToOnDependencysChange(c);
      });
  }

  /**
   * Watch all other controls that input control depends on to update itself
   */
  private listenToOnDependencysChange(control: ConfigFormControl | ConfigFormGroup) {
    if (!!control.dependsOn) {
      control.dependsOn().forEach(dep => {
        this.toUnsubscribe.push(dep.valueChanges.subscribe(v => {
          control.onDependencyChange(control);
        }));
      });
      // trigger on initial load for each control to be on its expected state against other controls
      control.onDependencyChange(control, true);
    }
  }

  /**
   * For the formgroup and all of its controls, register them to the dependencies.
   * In the way, each control has a list of the fields that depend on it.
   */
  private initDependentControls() {
    [
      ...this.configFormGroup.controlsRecursively,
      this.configFormGroup
    ]
      .filter((c: ConfigFormControl | ConfigFormGroup) => !!c.dependsOn)
      .forEach(
        (c: ConfigFormControl | ConfigFormGroup) => {
          c.dependsOn().forEach(d => {
            d.dependantControls = d.dependantControls || [];
            if (d.dependantControls.indexOf(c) < 0) {
              d.dependantControls.push(c);
            }
          });
        });
  }

  /**
   * Mark the controls that are child of another control
   */
  private markChildControls() {
    [
      ...this.configFormGroup.controlsRecursively,
      this.configFormGroup
    ]
      .filter(c => c instanceof ConfigFormControl)
      .forEach((c: ConfigFormControl) =>
        c.childs().forEach((child: ConfigFormControl) =>
          child.isChild = true));
  }

  public isFormControl(control: AbstractControl): ConfigFormControl | null {
    return control instanceof ConfigFormControl ? control : null;
  }

  public isFormGroup(control: AbstractControl): ConfigFormGroup | null {
    return control instanceof ConfigFormGroup ? control : null;
  }

  public isFormGroupArray(control: AbstractControl): ConfigFormGroupArray | null {
    return control instanceof ConfigFormGroupArray ? control : null;
  }

  public trustHtml = (html) => this.sanitizer.bypassSecurityTrustHtml(html);

  public hasChildSteps = () =>
    Object.values(this.configFormGroup.controls)
      .filter(c => (c instanceof ConfigFormGroup && !!c.stepName))
      .length > 0

  public hasChildTabs = () =>
    Object.values(this.configFormGroup.controls)
      .filter(c => (c instanceof ConfigFormGroup && !!c.tabName))
      .length > 0

  public isFirstControl = (control: AbstractControl) =>
    Object.values(this.configFormGroup.controls)[0] === control

  public isLastControl = (control: AbstractControl) =>
    Object.values(this.configFormGroup.controls).pop() === control

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
