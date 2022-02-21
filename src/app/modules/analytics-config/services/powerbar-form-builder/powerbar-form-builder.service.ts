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
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { DialogColorTableComponent } from '@map-config/components/dialog-color-table/dialog-color-table.component';
import { DialogColorTableData, KeywordColor } from '@map-config/components/dialog-color-table/models';
import { CollectionService } from '@services/collection-service/collection.service';
import { CollectionField } from '@services/collection-service/models';
import { NUMERIC_OR_DATE_TYPES, toKeywordOptionsObs } from '@services/collection-service/tools';
import { DefaultConfig, DefaultValuesService } from '@services/default-values/default-values.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { CollectionConfigFormGroup } from '@shared-models/collection-config-form';
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
import { WidgetFormBuilder } from '../widget-form-builder';

export class PowerbarConfigForm extends CollectionConfigFormGroup {

  public constructor(
    collection: string,
    collectionFields: Observable<Array<CollectionField>>,
    private globalKeysToColortrl: FormArray,
    defaultConfig: DefaultConfig,
    dialog: MatDialog,
    collectionService: CollectionService,
    private colorService: ArlasColorGeneratorLoader,
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
            collectionService.getCollections().map(c => ({ label: c, value: c })),
            {
              optional: false,
              resetDependantsOnChange: true
            }
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
                  .getCollectionFields(this.customControls.dataStep.collection.value)).subscribe(collectionFs => {
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
            30,
            1
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
          ),
        }).withTabName(marker('Data')),
        renderStep: new ConfigFormGroup({
          modeColor: new SelectFormControl(
            '',
            marker('Method to retrive powerbar color'),
            marker('Method to retrive powerbar color description'),
            false,
            [
              PROPERTY_SELECTOR_SOURCE.manual, PROPERTY_SELECTOR_SOURCE.provided
            ].map(d => ({
              value: d,
              enabled: true,
              label: d.toString()
            })), {
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
                if (this.customControls.renderStep.modeColor.value === PROPERTY_SELECTOR_SOURCE.provided) {
                  control.setValue(true);
                } else {
                  control.setValue(false);
                }
              }
            }
          ),
          propertyProvidedFieldCtrl: new SelectFormControl(
            '',
            marker('Provided field'),
            marker('Provided source powerbar field description'),
            true,
            toKeywordOptionsObs(collectionFields),
            {
              dependsOn: () => [this.customControls.renderStep.modeColor, this.customControls.dataStep.collection],
              onDependencyChange: (control: SelectFormControl) => {
                control.enableIf(this.customControls.renderStep.modeColor.value === PROPERTY_SELECTOR_SOURCE.provided);
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
                    collection: this.collection,
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
      propertyProvidedFieldCtrl: this.get('renderStep').get('propertyProvidedFieldCtrl') as SelectFormControl,
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

  public constructor(
    protected collectionService: CollectionService,
    protected mainFormService: MainFormService,
    private dialog: MatDialog,
    private colorService: ArlasColorGeneratorLoader,
    private defaultValuesService: DefaultValuesService,
    private metricBuilderService: MetricCollectFormBuilderService

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
      this.metricBuilderService.build(collection, 'powerbars'));
    this.defaultValuesService.setDefaultValueRecursively(this.defaultKey, formGroup);

    return formGroup;
  }

}
