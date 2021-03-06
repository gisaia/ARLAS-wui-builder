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
import { MainFormService } from '@services/main-form/main-form.service';
import {
  LookAndFeelGlobalFormGroup
} from '@look-and-feel-config/services/look-and-feel-global-form-builder/look-and-feel-global-form-builder.service';
import { importElements } from '@services/main-form-manager/tools';
import { Config } from '@services/main-form-manager/models-config';

@Injectable({
  providedIn: 'root'
})
export class LookAndFeelImportService {

  constructor(
    private mainFormService: MainFormService
  ) { }

  public doImport(config: Config) {

    const configOptions = config.arlas.web.options ? config.arlas.web.options : null;

    const globalLookAndFeelFg = this.mainFormService.lookAndFeelConfig.getGlobalFg() as LookAndFeelGlobalFormGroup;

    if (configOptions) {

      importElements([
        {
          value: configOptions.drag_items,
          control: globalLookAndFeelFg.customControls.dragAndDrop
        },
        {
          value: configOptions.zoom_to_data,
          control: globalLookAndFeelFg.customControls.zoomToData
        },
        {
          value: configOptions.indicators,
          control: globalLookAndFeelFg.customControls.indicators
        },
        {
          value: config['arlas-wui'].web.app.unit,
          control: globalLookAndFeelFg.customControls.appUnit
        }
      ]);

      if ( configOptions.spinner) {
        importElements([
          {
            value: configOptions.spinner.show,
            control: globalLookAndFeelFg.customControls.spinner
          },
          {
            value: configOptions.spinner.color,
            control: globalLookAndFeelFg.customControls.spinnerColor
          },
          {
            value: configOptions.spinner.diameter,
            control: globalLookAndFeelFg.customControls.spinnerDiameter
          }
        ]);
      }
    }
  }
}
