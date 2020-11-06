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
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { ConfigFormGroup, SelectFormControl, SliderFormControl, SlideToggleFormControl } from '@shared-models/config-form';

export class LookAndFeelGlobalFormGroup extends ConfigFormGroup {

  constructor(
  ) {
    super(
      {
        dragAndDrop: new SlideToggleFormControl(
          '',
          marker('Drag and drop'),
          marker('Drag and drop description'),
          { title: marker('Look and feel') }
        ),
        zoomToData: new SlideToggleFormControl(
          '',
          marker('Zoom to data'),
          marker('Zoom to data description')
        ),
        indicators: new SlideToggleFormControl(
          '',
          marker('Display indicators'),
          marker('Display indicators description')
        ),
        spinner: new SlideToggleFormControl(
          '',
          marker('Display spinners'),
          marker('Display spinners description'),
        ),
        spinnerColor: new SelectFormControl(
          '',
          marker('Spinners color'),
          null,
          null,
          [
            { label: marker('Primary'), value: 'primary' },
            { label: marker('Accent'), value: 'accent' }
          ],
          {
            dependsOn: () => [this.customControls.spinner],
            onDependencyChange: (control) =>
              this.customControls.spinner.value ? control.enable() : control.disable()
          }
        ),
        spinnerDiameter: new SliderFormControl(
          '',
          marker('Spinner diameter'),
          null,
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
    private defaultValuesService: DefaultValuesService,
  ) { }

  public build() {
    const globalFg = new LookAndFeelGlobalFormGroup();

    this.defaultValuesService.setDefaultValueRecursively('lookAndFeel.global', globalFg);
    return globalFg;
  }
}
