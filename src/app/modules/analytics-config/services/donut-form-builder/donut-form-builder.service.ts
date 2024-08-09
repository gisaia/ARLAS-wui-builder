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
import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { DialogColorTableComponent } from '@map-config/components/dialog-color-table/dialog-color-table.component';
import { DialogColorTableData, KeywordColor } from '@map-config/components/dialog-color-table/models';
import { CollectionService } from '@services/collection-service/collection.service';
import { CollectionField } from '@services/collection-service/models';
import { toKeywordOptionsObs } from '@services/collection-service/tools';
import { DefaultConfig, DefaultValuesService } from '@services/default-values/default-values.service';
import { MainFormService } from '@services/main-form/main-form.service';
import {
  ButtonFormControl, ConfigFormGroup, FieldWithSizeListFormControl, HiddenFormControl, SelectFormControl,
  SliderFormControl, SlideToggleFormControl, TitleInputFormControl
} from '@shared-models/config-form';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { Observable, Subscription } from 'rxjs';
import { WidgetFormBuilder } from '../widget-form-builder';
import { ArlasColorService } from 'arlas-web-components';

import { WidgetConfigFormGroup } from '@shared-models/widget-config-form';

export class DonutConfigForm extends WidgetConfigFormGroup {

  public constructor(
    collection: string,
    collectionFields: Observable<Array<CollectionField>>,
    private globalKeysToColortrl: FormArray,
    defaultConfig: DefaultConfig,
    dialog: MatDialog,
    collectionService: CollectionService,
    private colorService: ArlasColorService
  ) {
    super(
      collection,
      {
        title: new TitleInputFormControl(
          '',
          marker('donut title'),
          marker('donut title description')
        ),
        dataStep: new ConfigFormGroup({
          collection: new SelectFormControl(
            collection,
            marker('Collection'),
            marker('Donut collection description'),
            false,
            collectionService.getCollections().map(c => ({ label: c, value: c })),
            {
              optional: false,
              resetDependantsOnChange: true
            }
          ),
          aggregationmodels: new FieldWithSizeListFormControl(
            '',
            '',
            marker('donut field description'),
            collectionFields,
            {
              dependsOn: () => [
                this.customControls.dataStep.collection,
              ],
              onDependencyChange: (control: FieldWithSizeListFormControl) => {
                this.setCollection(this.customControls.dataStep.collection.value);
                toKeywordOptionsObs(collectionService.getCollectionFields(this.collection)).subscribe(fields => {
                  control.fields = fields;
                  control.filterAutocomplete();
                  if (!control.getValueAsSet()) {
                    control.setValue(new Set());
                  }
                });
              }
            }
          )
        }).withTabName(marker('Data')),
        renderStep: new ConfigFormGroup({
          opacity: new SliderFormControl(
            '',
            marker('Opacity'),
            marker('donut opacity description'),
            0,
            1,
            0.1
          ),
          multiselectable: new SlideToggleFormControl(
            '',
            marker('Multiselectable'),
            marker('Donut multiselectable description')
          ),
          keysToColorsButton: new ButtonFormControl(
            '',
            marker('Manage colors'),
            marker('Donut manage colors description'),
            // TODO put in common with powerbar
            () => collectionService.getTermAggregation(
              this.collection,
              (Array.from(this.customControls.dataStep.aggregationmodels.value)[0] as any).field)
              .then((keywords: Array<string>) => {
                keywords.forEach((k: string, index: number) => {
                  this.addToColorManualValuesCtrl({
                    keyword: k,
                    color: this.colorService.getColor(k)
                  }, index);
                });
                this.addToColorManualValuesCtrl({
                  keyword: 'OTHER',
                  color: defaultConfig.otherColor
                });

                const sub: Subscription = dialog.open(DialogColorTableComponent, {
                  data: {
                    collection: this.collection,
                    sourceField: (Array.from(this.customControls.dataStep.aggregationmodels.value)[0] as any).field,
                    keywordColors: globalKeysToColortrl.value
                  } as DialogColorTableData,
                  autoFocus: false,
                })
                  .afterClosed().subscribe((result: Array<KeywordColor>) => {
                    if (result !== undefined) {
                      globalKeysToColortrl.clear();
                      result.forEach((kc: KeywordColor) => {
                        /** after closing the dialog, save the [keyword, color] list in the Arlas color service */
                        (this.colorService.colorGenerator as ArlasColorGeneratorLoader).updateKeywordColor(kc.keyword, kc.color);
                        this.addToColorManualValuesCtrl(kc);
                      });
                    }
                    sub.unsubscribe();
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
            }),
          showExportCsv: new SlideToggleFormControl(
            '',
            marker('export csv donut'),
            marker('export csv donut description')
          ),
        }).withTabName(marker('Render')),
        unmanagedFields: new FormGroup({
          renderStep: new FormGroup({
            customizedCssClass: new FormControl(),
            diameter: new FormControl(),
            containerWidth: new FormControl(),
          })
        })
      });
  }

  public customControls = {
    uuid: this.get('uuid') as HiddenFormControl,
    usage: this.get('usage') as HiddenFormControl,
    title: this.get('title') as TitleInputFormControl,
    dataStep: {
      collection: this.get('dataStep').get('collection') as SelectFormControl,
      aggregationmodels: this.get('dataStep').get('aggregationmodels') as FieldWithSizeListFormControl
    },
    renderStep: {
      opacity: this.get('renderStep').get('opacity') as SliderFormControl,
      multiselectable: this.get('renderStep').get('multiselectable') as SlideToggleFormControl,
      keysToColorsButton: this.get('renderStep').get('keysToColorsButton') as ButtonFormControl,
      showExportCsv: this.get('renderStep').get('showExportCsv') as SlideToggleFormControl
    },
    unmanagedFields: {
      renderStep: {
        customizedCssClass: this.get('unmanagedFields.renderStep.customizedCssClass'),
        diameter: this.get('unmanagedFields.renderStep.diameter'),
        containerWidth: this.get('unmanagedFields.renderStep.containerWidth'),
      }
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

  public constructor(
    protected collectionService: CollectionService,
    protected mainFormService: MainFormService,
    private defaultValuesService: DefaultValuesService,
    private dialog: MatDialog,
    private colorService: ArlasColorService
  ) {
    super(collectionService, mainFormService);
  }

  public build(collection: string) {
    const formGroup = new DonutConfigForm(
      collection,
      this.collectionService.getCollectionFields(collection),
      this.mainFormService.commonConfig.getKeysToColorFa(),
      this.defaultValuesService.getDefaultConfig(),
      this.dialog,
      this.collectionService,
      this.colorService
    );
    this.defaultValuesService.setDefaultValueRecursively(this.defaultKey, formGroup);

    return formGroup;
  }

}
