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
import { Injectable } from '@angular/core';
import { ConfigFormGroup, SlideToggleFormControl, SliderFormControl } from '@shared-models/config-form';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import { SelectFormControl } from '../../../../shared/models/config-form';

export class LookAndFeelGlobalFormGroup extends ConfigFormGroup {

  constructor(
  ) {
    super(
      {
        dragAndDrop: new SlideToggleFormControl(
          '',
          'Drag and drop',
          'description',
          null,
          { title: 'Look and feel'}
        ),
        zoomToData: new SlideToggleFormControl(
          '',
          'Zoom to data',
          'description'
        ),
        indicators: new SlideToggleFormControl(
          '',
          'Display indicators',
          'description'
        ),
        spinner: new SlideToggleFormControl(
          '',
          'Display spinners',
          'description',
        ),
        spinnerColor: new SelectFormControl(
          '',
          'Spinners color',
          'description',
          null,
          [
            { label: 'Primary', value: 'primary' },
            { label: 'Accent', value: 'accent' }
          ],
          {
            dependsOn: () => [this.customControls.spinner],
            onDependencyChange: (control) =>
              this.customControls.spinner.value ? control.enable() : control.disable()
          }
        ),
        spinnerDiameter: new SliderFormControl(
          '',
          'Spinner diameter',
          'description',
          10,
          100,
          10,
          null,
          null,
          {
            dependsOn: () => [this.customControls.spinner],
            onDependencyChange: (control) =>
              this.customControls.spinner.value ? control.enable() : control.disable()
          }
        )
      }
    );
  }

  public customControls = {
    dragAndDrop: this.get('dragAndDrop') as SlideToggleFormControl,
    zoomToData: this.get('zoomToData') as SlideToggleFormControl,
    indicators: this.get('indicators') as SlideToggleFormControl,
    spinner: this.get('spinner') as SlideToggleFormControl,
    spinnerColor: this.get('spinnerColor') as SelectFormControl,
    spinnerDiameter: this.get('spinnerDiameter') as SliderFormControl
  };
}



@Injectable({
  providedIn: 'root'
})
export class LookAndFeelGlobalFormBuilderService {

  constructor(
    private formBuilderDefault: FormBuilderWithDefaultService
  ) { }

  public build() {
    const globalFg = new LookAndFeelGlobalFormGroup();

    this.formBuilderDefault.setDefaultValueRecursively('lookAndFeel.global', globalFg);
    return globalFg;
  }
}
