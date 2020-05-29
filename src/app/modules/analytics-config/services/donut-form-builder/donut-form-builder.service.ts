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
  ConfigFormGroup, InputFormControl, FieldWithSizeListFormControl, SliderFormControl, SlideToggleFormControl, ButtonFormControl
} from '@shared-models/config-form';
import { WidgetFormBuilder } from '../widget-form-builder';
import { MainFormService } from '@services/main-form/main-form.service';
import { CollectionService } from '@services/collection-service/collection.service';
import { Observable } from 'rxjs';
import { CollectionField } from '@services/collection-service/models';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import { KeywordColor, DialogColorTableData } from '@map-config/components/dialog-color-table/models';
import { FormControl, FormArray, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { DefaultConfig, DefaultValuesService } from '@services/default-values/default-values.service';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { DialogColorTableComponent } from '@map-config/components/dialog-color-table/dialog-color-table.component';

export class DonutConfigForm extends ConfigFormGroup {

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
        aggregationmodels: new FieldWithSizeListFormControl(
          '',
          '',
          'description',
          collectionFields
        )
      }),
      renderStep: new ConfigFormGroup({
        opacity: new SliderFormControl(
          '',
          'Opacity',
          'description',
          0,
          100,
          1
        ),
        multiselectable: new SlideToggleFormControl(
          '',
          'Multiselectable',
          'description'
        ),
        keysToColorsButton: new ButtonFormControl(
          '',
          'Manage colors',
          'Description',
          // TODO put in common with powerbar
          () => collectionService.getTermAggregation(
            collection,
            (Array.from(this.customControls.dataStep.aggregationmodels.value)[0] as any).field)
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
                  sourceField: (Array.from(this.customControls.dataStep.aggregationmodels.value)[0] as any).field,
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
              this.customControls.dataStep.aggregationmodels,
            ],
            onDependencyChange: (control: ButtonFormControl) => {
              control.disabledButton = !this.customControls.dataStep.aggregationmodels.value
                || Array.from(this.customControls.dataStep.aggregationmodels.value).length === 0;
            }
          })
      })
    });
  }

  public customControls = {
    dataStep: {
      name: this.get('dataStep').get('name') as InputFormControl,
      aggregationmodels: this.get('dataStep').get('aggregationmodels') as FieldWithSizeListFormControl,
    },
    renderStep: {
      opacity: this.get('renderStep').get('opacity') as SliderFormControl,
      multiselectable: this.get('renderStep').get('multiselectable') as SlideToggleFormControl,
      keysToColorsButton: this.get('renderStep').get('keysToColorsButton') as ButtonFormControl,
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
export class DonutFormBuilderService extends WidgetFormBuilder {

  public defaultKey = 'analytics.widgets.donut';

  constructor(
    protected collectionService: CollectionService,
    protected mainFormService: MainFormService,
    private formBuilderDefault: FormBuilderWithDefaultService,
    private dialog: MatDialog,
    private colorService: ArlasColorGeneratorLoader,
    private defaultValuesService: DefaultValuesService
  ) {
    super(collectionService, mainFormService);
  }

  public build() {
    const formGroup = new DonutConfigForm(
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