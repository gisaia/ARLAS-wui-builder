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
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { DialogColorTableComponent } from '@map-config/components/dialog-color-table/dialog-color-table.component';
import { DialogColorTableData, KeywordColor } from '@map-config/components/dialog-color-table/models';
import { CollectionService } from '@services/collection-service/collection.service';
import { CollectionField } from '@services/collection-service/models';
import { NUMERIC_OR_DATE_TYPES, toKeywordOptionsObs } from '@services/collection-service/tools';
import { DefaultConfig, DefaultValuesService } from '@services/default-values/default-values.service';
import { MainFormService } from '@services/main-form/main-form.service';
import {
  ButtonFormControl, ConfigFormGroup, SelectFormControl, SliderFormControl,
  SlideToggleFormControl, TitleInputFormControl
} from '@shared-models/config-form';
import { PROPERTY_SELECTOR_SOURCE } from '@shared-services/property-selector-form-builder/models';
import { Metric } from 'arlas-api';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { Observable } from 'rxjs';
import { HiddenFormControl } from '../../../../shared/models/config-form';
import {
  MetricCollectFormBuilderService, MetricCollectFormGroup
} from '../metric-collect-form-builder/metric-collect-form-builder.service';
import { METRIC_TYPE } from '../metric-collect-form-builder/models';
import { WidgetFormBuilder } from '../widget-form-builder';
import { ArlasColorService } from 'arlas-web-components';

import { WidgetConfigFormGroup } from '@shared-models/widget-config-form';
import { addToColorManualValuesCtrl } from '@utils/tools';

export class PowerbarConfigForm extends WidgetConfigFormGroup {

  public constructor(
    collection: string,
    collectionFields: Observable<Array<CollectionField>>,
    private globalKeysToColortrl: FormArray,
    defaultConfig: DefaultConfig,
    dialog: MatDialog,
    collectionService: CollectionService,
    private colorService: ArlasColorService,
    metricFg: MetricCollectFormGroup
  ) {
    super(
      collection,
      {
        title: new TitleInputFormControl(
          '',
          marker('powerbar title'),
          marker('powerbar title description')
        ),
        dataStep: new ConfigFormGroup({
          collection: new SelectFormControl(
            collection,
            marker('Collection'),
            marker('Powerbar collection description'),
            false,
            [],
            {
              optional: false,
              resetDependantsOnChange: true,
              isCollectionSelect: true
            },
            collectionService.getGroupCollectionItems()
          ),
          aggregationField: new SelectFormControl(
            '',
            marker('Powerbar field'),
            marker('Powerbar field description'),
            true,
            toKeywordOptionsObs(collectionFields),
            {
              dependsOn: () => [this.customControls.dataStep.collection],
              onDependencyChange: (control: SelectFormControl) => {
                toKeywordOptionsObs(collectionService
                  .getCollectionFields(this.customControls.dataStep.collection.value))
                  .subscribe(collectionFs => {
                    control.setSyncOptions(collectionFs);
                  });
              }
            }
          ),
          aggregationSize: new SliderFormControl(
            '',
            marker('Powerbar size'),
            marker('powerbar size description'),
            1,
            500,
            10
          ),
          metric: metricFg.withTitle(marker('Metric')).withDependsOn(() => [this.customControls.dataStep.collection])
            .withOnDependencyChange((control) => {
              metricFg.setCollection(this.customControls.dataStep.collection.value);
              const filterCallback = (field: CollectionField) =>
                metricFg.customControls.metricCollectFunction.value === Metric.CollectFctEnum.CARDINALITY ?
                  field : NUMERIC_OR_DATE_TYPES.indexOf(field.type) >= 0;
              collectionService.getCollectionFields(this.customControls.dataStep.collection.value).subscribe(
                fields => {
                  metricFg.customControls.metricCollectField.setSyncOptions(
                    fields
                      .filter(filterCallback)
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(f => ({ value: f.name, label: f.name, enabled: f.indexed })));
                }
              );
            }
            ),

          unit: new TitleInputFormControl(
            '',
            marker('powerbar unit'),
            marker('powerbar unit description'),
            'text',
            {
              optional: true
            }
          ),
          operator: new SelectFormControl(
            '',
            marker('Powerbar operator'),
            marker('Powerbar operator description'),
            false,
            [
              { label: 'include', value: 'Eq' },
              { label: 'exclude', value: 'Neq' }
            ],
            {
              optional: false
            }
          ),
        }).withTabName(marker('Data')),
        renderStep: new ConfigFormGroup({
          modeColor: new SelectFormControl(
            '',
            marker('Method to retrive powerbar color'),
            marker('Method to retrive powerbar color description'),
            false,
            [
              PROPERTY_SELECTOR_SOURCE.manual, PROPERTY_SELECTOR_SOURCE.provided_color
            ].map(d => ({
              value: d,
              enabled: true,
              label: d.toString()
            })),
            {
              optional: true,
              childs: () => [
                this.customControls.renderStep.useColorService,
                this.customControls.renderStep.useColorFromData
              ],
            }),
          useColorService: new HiddenFormControl(
            '',
            undefined,
            {
              optional: true,
              dependsOn: () => [
                this.customControls.renderStep.modeColor
              ],
              onDependencyChange: (control: ButtonFormControl) => {
                if (this.customControls.renderStep.modeColor.value === PROPERTY_SELECTOR_SOURCE.manual) {
                  control.setValue(true);
                } else {
                  control.setValue(false);
                }
              }
            }
          ),
          useColorFromData: new HiddenFormControl(
            '',
            undefined,
            {
              optional: true,
              dependsOn: () => [
                this.customControls.renderStep.modeColor
              ],
              onDependencyChange: (control: ButtonFormControl) => {
                if (this.customControls.renderStep.modeColor.value === PROPERTY_SELECTOR_SOURCE.provided_color) {
                  control.setValue(true);
                } else {
                  control.setValue(false);
                }
              }
            }
          ),
          propertyProvidedColorFieldCtrl: new SelectFormControl(
            '',
            marker('Provided field'),
            marker('Provided source powerbar field description'),
            true,
            toKeywordOptionsObs(collectionFields),
            {
              dependsOn: () => [this.customControls.renderStep.modeColor, this.customControls.dataStep.collection],
              onDependencyChange: (control: SelectFormControl) => {
                control.enableIf(this.customControls.renderStep.modeColor.value === PROPERTY_SELECTOR_SOURCE.provided_color);
                if (control.enabled && (!this.collection || this.customControls.dataStep.collection.value !== this.collection)) {
                  this.setCollection(this.customControls.dataStep.collection.value);
                  toKeywordOptionsObs(collectionService.getCollectionFields(this.collection)).subscribe(collectionFds => {
                    control.setSyncOptions(collectionFds);
                  });
                }
              }
            }
          ),
          keysToColorsButton: new ButtonFormControl(
            '',
            marker('Manage colors'),
            marker('Powerbar manually associate colors description'),
            () => collectionService.getTermAggregation(this.collection, this.customControls.dataStep.aggregationField.value)
              .then((keywords: Array<string>) => {
                globalKeysToColortrl.clear();
                keywords.forEach((k: string, index: number) => {
                  addToColorManualValuesCtrl({
                    keyword: k,
                    color: this.colorService.getColor(k)
                  }, this.globalKeysToColortrl, index);
                });
                addToColorManualValuesCtrl({
                  keyword: 'OTHER',
                  color: defaultConfig.otherColor
                }, this.globalKeysToColortrl);

                const sub = dialog.open(DialogColorTableComponent, {
                  data: {
                    collection: this.collection,
                    sourceField: this.customControls.dataStep.aggregationField.value,
                    keywordColors: globalKeysToColortrl.value
                  } as DialogColorTableData,
                  autoFocus: false,
                })
                  .afterClosed().subscribe((result: Array<KeywordColor>) => {
                    if (result !== undefined) {
                      result.forEach((kc: KeywordColor) => {
                        /** after closing the dialog, save the [keyword, color] list in the ARLAS color service */
                        (colorService.colorGenerator as ArlasColorGeneratorLoader).updateKeywordColor(kc.keyword, kc.color);
                        addToColorManualValuesCtrl(kc, this.globalKeysToColortrl);
                      });
                    }
                    sub.unsubscribe();
                  });
              }),
            marker('A field is required to manage colors'),
            {
              optional: true,
              dependsOn: () => [
                this.customControls.renderStep.modeColor,
                this.customControls.dataStep.aggregationField,
                this.customControls.dataStep.collection,
              ],
              onDependencyChange: (control: ButtonFormControl) => {
                control.enableIf(this.customControls.renderStep.modeColor.value === PROPERTY_SELECTOR_SOURCE.manual &&
                  !!this.customControls.dataStep.aggregationField.value);
                control.disabledButton = !this.customControls.renderStep.modeColor.value &&
                  !this.customControls.dataStep.aggregationField.value;
              }
            }),
          displayFilter: new SlideToggleFormControl(
            '',
            marker('Display the filter'),
            marker('powerbar display filter description')
          ),
          scrollable: new SlideToggleFormControl(
            '',
            marker('Scrollable powerbar'),
            marker('Scrollable powerbar description')
          ),
          showExportCsv: new SlideToggleFormControl(
            '',
            marker('export csv powerbars'),
            marker('export csv powerbars description')
          ),
          allowOperatorChange: new SlideToggleFormControl(
            '',
            marker('operator powerbars'),
            marker('operator powerbars description')
          )
        }).withTabName(marker('Render')),
        unmanagedFields: new FormGroup({}) // for consistency with other widgets form builders
      });
  }

  public customControls = {
    uuid: this.get('uuid') as HiddenFormControl,
    usage: this.get('usage') as HiddenFormControl,
    title: this.get('title') as TitleInputFormControl,
    dataStep: {
      collection: this.get('dataStep').get('collection') as SelectFormControl,
      aggregationField: this.get('dataStep').get('aggregationField') as SelectFormControl,
      aggregationSize: this.get('dataStep').get('aggregationSize') as SliderFormControl,
      metric: this.get('dataStep').get('metric') as MetricCollectFormGroup,
      unit: this.get('dataStep').get('unit') as TitleInputFormControl,
      operator: this.get('dataStep').get('operator') as SelectFormControl,
    },
    renderStep: {
      modeColor: this.get('renderStep').get('modeColor') as SelectFormControl,
      propertyProvidedColorFieldCtrl: this.get('renderStep').get('propertyProvidedColorFieldCtrl') as SelectFormControl,
      useColorService: this.get('renderStep').get('useColorService') as HiddenFormControl,
      useColorFromData: this.get('renderStep').get('useColorFromData') as HiddenFormControl,
      keysToColorsButton: this.get('renderStep').get('keysToColorsButton') as ButtonFormControl,
      displayFilter: this.get('renderStep').get('displayFilter') as SlideToggleFormControl,
      scrollable: this.get('renderStep').get('scrollable') as SlideToggleFormControl,
      allowOperatorChange: this.get('renderStep').get('allowOperatorChange') as SlideToggleFormControl,
      showExportCsv: this.get('renderStep').get('showExportCsv') as SlideToggleFormControl,
    },
    unmanagedFields: {}
  };
}

@Injectable({
  providedIn: 'root'
})
export class PowerbarFormBuilderService extends WidgetFormBuilder {
  public defaultKey = 'analytics.widgets.powerbar';

  public constructor(
    protected collectionService: CollectionService,
    protected mainFormService: MainFormService,
    private dialog: MatDialog,
    private colorService: ArlasColorService,
    private defaultValuesService: DefaultValuesService,
    private metricBuilderService: MetricCollectFormBuilderService,
  ) {
    super(collectionService, mainFormService);
  }

  public build(collection: string): PowerbarConfigForm {
    const formGroup = new PowerbarConfigForm(
      collection,
      this.collectionService.getCollectionFields(collection),
      this.mainFormService.commonConfig.getKeysToColorFa(),
      this.defaultValuesService.getDefaultConfig(),
      this.dialog,
      this.collectionService,
      this.colorService,
      this.metricBuilderService.build(collection, METRIC_TYPE.POWERBARS, true));
    this.defaultValuesService.setDefaultValueRecursively(this.defaultKey, formGroup);

    return formGroup;
  }

}
