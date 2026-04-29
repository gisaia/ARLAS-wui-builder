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

import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ConfigFormControl, ConfigFormGroup } from '@shared-models/config-form';
import { Subject, Subscription } from 'rxjs';
import { ConfigFormGroupComponent } from './config-form-group.component';

@Component({
  template: ''
})
export abstract class AsbtractConfigFormControl implements OnInit, OnDestroy {
  @Input() public configFormGroup: ConfigFormGroup;
  @Input() public parentConfigFormGroup: ConfigFormGroup;
  @Input() public isSubGroup: boolean;
  @Input() public defaultKey: string;

  @Output() public updateSyncOptions = new Subject<{ prefix: string; control: FormControl; }>();

  public toUnsubscribe: Array<Subscription> = [];

  /**
   * The root ConfigFormGroup is responsible of all its sub-controls.
   * At loading, it browses all the sub-controls to manage their state.
   * At first, we didn't have a notion of root / subgroup, we just used
   * to initialize the sub-controls of a group when displaying it; however
   * some field in a not-displayed (ia not initialized) subgroup may
   * depend on a displayed field, this was not managed.
   */
  public ngOnInit() {
    if (!this.isSubGroup) {
      ConfigFormGroupComponent.listenToAllControlsOnDependencyChange(this.configFormGroup, this.toUnsubscribe);
      this.initDependentControls();
      this.markChildControls();
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
            if (!d.dependantControls.includes(c)) {
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

  public ngOnDestroy(): void {
    this.toUnsubscribe.forEach(u => u.unsubscribe());
    this.configFormGroup = null;
    this.isSubGroup = null;
    this.defaultKey = null;
  }
}
