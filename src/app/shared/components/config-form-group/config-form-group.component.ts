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
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ConfigFormGroup, ConfigFormControl } from '@shared-models/config-form';
import { Observable, Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-config-form-group',
  templateUrl: './config-form-group.component.html',
  styleUrls: ['./config-form-group.component.scss']
})
export class ConfigFormGroupComponent implements OnInit, OnDestroy {

  @Input() public configFormGroup: ConfigFormGroup;
  @Input() public defaultKey: string;
  public toUnsubscribe: Array<Subscription> = [];

  constructor(
    private sanitizer: DomSanitizer
  ) { }

  public ngOnInit() {

    Object.values(this.configFormGroup.controls)
      .filter(c => c instanceof ConfigFormGroup || c instanceof ConfigFormControl)
      .forEach((c: ConfigFormGroup | ConfigFormControl) => {
        this.watchDependenciesChange(c);
        this.initDependantControls(c);

        if (c instanceof ConfigFormControl) {
          this.markChildControls(c);
        }
      });
  }

  public ngOnDestroy(): void {
    this.toUnsubscribe.forEach(u => u.unsubscribe());
  }

  /**
   * Watch all other controls that input control depends on to update itself
   */
  private watchDependenciesChange(control: ConfigFormControl | ConfigFormGroup) {
    if (!!control.dependsOn) {
      control.dependsOn().forEach(dep => {
        this.toUnsubscribe.push(dep.valueChanges.subscribe(v => {
          control.onDependencyChange(control);
        }));
      });
      // trigger on initial load
      control.onDependencyChange(control);
    }
  }

  /**
   * Set the list of other controls that depends on input control
   */
  private initDependantControls(control: ConfigFormControl | ConfigFormGroup) {
    control.dependantControls = this.configFormGroup.controlsValues
      .filter(
        (filterControl: ConfigFormControl) => !!filterControl.dependsOn &&
          filterControl.dependsOn().indexOf(control) >= 0);
  }

  /**
   * Mark the controls that are child of another control
   */
  private markChildControls(control: ConfigFormControl) {
    control.childs().forEach((child: ConfigFormControl) =>
      child.isChild = true);
  }

  public isFormControl(control: ConfigFormGroup | ConfigFormControl): ConfigFormControl | null {
    return control instanceof ConfigFormControl ? control : null;
  }

  public isFormGroup(control: ConfigFormGroup | ConfigFormControl): ConfigFormGroup | null {
    return control instanceof ConfigFormGroup ? control : null;
  }

  public trustHtml = (html) => this.sanitizer.bypassSecurityTrustHtml(html);

}
