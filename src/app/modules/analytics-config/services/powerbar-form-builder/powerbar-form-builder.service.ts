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
  ConfigFormGroup, InputFormControl, SlideToggleFormControl, SelectFormControl, SliderFormControl, ButtonFormControl
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
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';

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
      dataStep: new ConfigFormGroup({
        name: new InputFormControl(
          '',
          'title',
          'description'
        ),
        aggregationField: new SelectFormControl(
          '',
          'Field',
          'Description',
          true,
          toKeywordOptionsObs(collectionFields)
        ),
        aggregationSize: new SliderFormControl(
          '',
          'Size',
          'Description',
          0,
          100,
          1
        )
      }).withTabName('Data'),
      renderStep: new ConfigFormGroup({
        powerbarTitle: new InputFormControl(
          '',
          'Powerbar title',
          'Description'
        ),
        useColorService: new SlideToggleFormControl(
          '',
          'Manually associate colors',
          'description',
          {
            childs: () => [
              this.customControls.renderStep.keysToColorsButton
            ]
          }
        ),
        keysToColorsButton: new ButtonFormControl(
          '',
          'Manage colors',
          'Description',
          () => collectionService.getTermAggregation(collection, this.customControls.dataStep.aggregationField.value)
            .then((keywords: Array<string>) => {
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

              dialog.open(DialogColorTableComponent, {
                data: {
                  collection,
                  sourceField: this.customControls.dataStep.aggregationField.value,
                  keywordColors: globalKeysToColortrl.value
                } as DialogColorTableData,
                autoFocus: false,
              })
                .afterClosed().subscribe((result: Array<KeywordColor>) => {
                  if (result !== undefined) {
                    globalKeysToColortrl.clear();
                    result.forEach((k: KeywordColor) => {
                      this.addToColorManualValuesCtrl(k);
                    });
                  }
                });
            }),
          'A field is required to manage colors',
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
          'Display the filter',
          'description'
        )
      }).withTabName('Data')
    });
  }

  public customControls = {
    dataStep: {
      name: this.get('dataStep').get('name') as InputFormControl,
      aggregationField: this.get('dataStep').get('aggregationField') as SelectFormControl,
      aggregationSize: this.get('dataStep').get('aggregationSize') as SliderFormControl,
    },
    renderStep: {
      powerbarTitle: this.get('renderStep').get('powerbarTitle') as InputFormControl,
      useColorService: this.get('renderStep').get('useColorService') as SlideToggleFormControl,
      keysToColorsButton: this.get('renderStep').get('keysToColorsButton') as ButtonFormControl,
      displayFilter: this.get('renderStep').get('displayFilter') as SlideToggleFormControl,
    }
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
    private formBuilderDefault: FormBuilderWithDefaultService
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
      this.colorService
    );
    this.formBuilderDefault.setDefaultValueRecursively(this.defaultKey, formGroup);

    return formGroup;
  }

}
