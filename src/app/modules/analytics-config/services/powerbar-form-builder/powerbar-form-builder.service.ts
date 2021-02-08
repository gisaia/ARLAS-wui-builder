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
import {
  ConfigFormGroup, SlideToggleFormControl, SelectFormControl, SliderFormControl, ButtonFormControl, TitleInputFormControl
} from '@shared-models/config-form';
import { WidgetFormBuilder } from '../widget-form-builder';
import { CollectionService } from '@services/collection-service/collection.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { Observable } from 'rxjs';
import { CollectionField } from '@services/collection-service/models';
import { toKeywordOptionsObs } from '@services/collection-service/tools';
import { DialogColorTableComponent } from '@map-config/components/dialog-color-table/dialog-color-table.component';
import { DialogColorTableData, KeywordColor } from '@map-config/components/dialog-color-table/models';
import { MatDialog } from '@angular/material';
import { FormArray, FormGroup, FormControl } from '@angular/forms';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { DefaultConfig, DefaultValuesService } from '@services/default-values/default-values.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

export class PowerbarConfigForm extends ConfigFormGroup {

  constructor(
    collection: string,
    collectionFields: Observable<Array<CollectionField>>,
    private globalKeysToColortrl: FormArray,
    defaultConfig: DefaultConfig,
    dialog: MatDialog,
    collectionService: CollectionService,
    private colorService: ArlasColorGeneratorLoader,
  ) {
    super({
      title: new TitleInputFormControl(
        '',
        marker('powerbar title'),
        marker('powerbar title description')
      ),
      dataStep: new ConfigFormGroup({
        aggregationField: new SelectFormControl(
          '',
          marker('Powerbar field'),
          marker('Powerbar field description'),
          true,
          toKeywordOptionsObs(collectionFields)
        ),
        aggregationSize: new SliderFormControl(
          '',
          marker('Powerbar size'),
          marker('powerbar size description'),
          1,
          30,
          1
        )
      }).withTabName(marker('Data')),
      renderStep: new ConfigFormGroup({
        useColorService: new SlideToggleFormControl(
          '',
          marker('Manually associate colors'),
          marker('Powerbar manually associate colors description'),
          {
            childs: () => [
              this.customControls.renderStep.keysToColorsButton
            ]
          }
        ),
        keysToColorsButton: new ButtonFormControl(
          '',
          marker('Manage colors'),
          marker('Powerbar manage colors description'),
          () => collectionService.getTermAggregation(collection, this.customControls.dataStep.aggregationField.value)
            .then((keywords: Array<string>) => {
              globalKeysToColortrl.clear();
              keywords.forEach((k: string, index: number) => {
                this.addToColorManualValuesCtrl({
                  keyword: k,
                  color: colorService.getColor(k)
                }, index);
              });
              this.addToColorManualValuesCtrl({
                keyword: 'OTHER',
                color: defaultConfig.otherColor
              });

              const sub = dialog.open(DialogColorTableComponent, {
                data: {
                  collection,
                  sourceField: this.customControls.dataStep.aggregationField.value,
                  keywordColors: globalKeysToColortrl.value
                } as DialogColorTableData,
                autoFocus: false,
              })
                .afterClosed().subscribe((result: Array<KeywordColor>) => {
                  if (result !== undefined) {
                    result.forEach((kc: KeywordColor) => {
                      /** after closing the dialog, save the [keyword, color] list in the Arlas color service */
                      colorService.updateKeywordColor(kc.keyword, kc.color);
                      this.addToColorManualValuesCtrl(kc);
                    });
                  }
                  sub.unsubscribe();
                });
            }),
          marker('A field is required to manage colors'),
          {
            optional: true,
            dependsOn: () => [
              this.customControls.renderStep.useColorService,
              this.customControls.dataStep.aggregationField,
            ],
            onDependencyChange: (control: ButtonFormControl) => {
              control.enableIf(this.customControls.renderStep.useColorService.value);
              control.disabledButton = !this.customControls.dataStep.aggregationField.value;
            }
          }),
        displayFilter: new SlideToggleFormControl(
          '',
          marker('Display the filter'),
          marker('powerbar display filter description')
        ),
        showExportCsv: new SlideToggleFormControl(
          '',
          marker('export csv powerbars'),
          marker('export csv powerbars description')
        )
      }).withTabName(marker('Render')),
      unmanagedFields: new FormGroup({}) // for consistency with other widgets form builders
    });
  }

  public customControls = {
    title: this.get('title') as TitleInputFormControl,
    dataStep: {
      aggregationField: this.get('dataStep').get('aggregationField') as SelectFormControl,
      aggregationSize: this.get('dataStep').get('aggregationSize') as SliderFormControl,
    },
    renderStep: {
      useColorService: this.get('renderStep').get('useColorService') as SlideToggleFormControl,
      keysToColorsButton: this.get('renderStep').get('keysToColorsButton') as ButtonFormControl,
      displayFilter: this.get('renderStep').get('displayFilter') as SlideToggleFormControl,
      showExportCsv: this.get('renderStep').get('showExportCsv') as SlideToggleFormControl,
    },
    unmanagedFields: {}
  };

  private addToColorManualValuesCtrl(kc: KeywordColor, index?: number) {
    if (!Object.values(this.globalKeysToColortrl.controls)
      .find(keywordColorGrp => keywordColorGrp.get('keyword').value === kc.keyword)) {
      const keywordColorGrp = new FormGroup({
        keyword: new FormControl(kc.keyword),
        color: new FormControl(kc.color)
      });
      if (index !== undefined) {
        this.globalKeysToColortrl.insert(index, keywordColorGrp);
      } else {
        this.globalKeysToColortrl.push(keywordColorGrp);
      }
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class PowerbarFormBuilderService extends WidgetFormBuilder {
  public defaultKey = 'analytics.widgets.powerbar';

  constructor(
    protected collectionService: CollectionService,
    protected mainFormService: MainFormService,
    private dialog: MatDialog,
    private colorService: ArlasColorGeneratorLoader,
    private defaultValuesService: DefaultValuesService,
  ) {
    super(collectionService, mainFormService);
  }

  public build(): PowerbarConfigForm {
    const formGroup = new PowerbarConfigForm(
      this.mainFormService.getCollections()[0],
      this.collectionService.getCollectionFields(
        this.mainFormService.getCollections()[0]),
        this.mainFormService.commonConfig.getKeysToColorFa(),
        this.defaultValuesService.getDefaultConfig(),
        this.dialog,
        this.collectionService,
        this.colorService);
    this.defaultValuesService.setDefaultValueRecursively(this.defaultKey, formGroup);

    return formGroup;
  }

}
