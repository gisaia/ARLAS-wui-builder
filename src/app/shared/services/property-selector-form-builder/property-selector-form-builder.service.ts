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
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { PROPERTY_SELECTOR_SOURCE, PROPERTY_TYPE, COUNT_OR_METRIC } from '@shared-services/property-selector-form-builder/models';
import {
  ConfigFormGroup, SelectFormControl, ColorFormControl, SliderFormControl, ButtonFormControl,
  SlideToggleFormControl,
  InputFormControl,
  HiddenFormControl,
  ConfigFormControl,
  ButtonToggleFormControl,
  ColorPreviewFormControl
} from '@shared-models/config-form';
import { DefaultConfig, DefaultValuesService } from '@services/default-values/default-values.service';
import { toKeywordOptionsObs, toNumericOrDateOptionsObs, toTextOrKeywordOptionsObs } from '@services/collection-service/tools';
import { Observable } from 'rxjs';
import { CollectionField } from '@services/collection-service/models';
import { MatDialog } from '@angular/material';
import { DialogColorTableComponent } from '@map-config/components/dialog-color-table/dialog-color-table.component';
import { DialogColorTableData, KeywordColor } from '@map-config/components/dialog-color-table/models';
import { CollectionService, METRIC_TYPES } from '@services/collection-service/collection.service';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { MainFormService } from '@services/main-form/main-form.service';
import { DialogPaletteSelectorData } from '@map-config/components/dialog-palette-selector/model';
import { DialogPaletteSelectorComponent } from '@map-config/components/dialog-palette-selector/dialog-palette-selector.component';
import { GEOMETRY_TYPE } from '@map-config/services/map-layer-form-builder/models';
import { valuesToOptions } from '@utils/tools';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { CollectionConfigFormGroup } from '@shared-models/collection-config-form';

export class PropertySelectorFormGroup extends CollectionConfigFormGroup {
  constructor(
    defaultConfig: DefaultConfig,
    dialog: MatDialog,
    collectionService: CollectionService,
    colorService: ArlasColorGeneratorLoader,
    collection: string,
    collectionFieldsObs: Observable<Array<CollectionField>>,
    private propertyType: PROPERTY_TYPE,
    propertyName: string,
    sources: Array<PROPERTY_SELECTOR_SOURCE>,
    isAggregated: boolean,
    description?: string,
    geometryTypeControl?: () => SelectFormControl
  ) {
    super(
      collection,
      {
      propertySource: new SelectFormControl(
        '',
        propertyName.charAt(0).toUpperCase() + propertyName.slice(1),
        description,
        false,
        valuesToOptions(sources),
        {
          childs: () => [
            this.customControls.propertyFix,
            this.customControls.propertyProvidedFieldCtrl,
            this.customControls.propertyProvidedFieldLabelCtrl,
            this.customControls.propertyGeneratedFieldCtrl,
            this.customControls.propertyManualFg.propertyManualFieldCtrl,
            this.customControls.propertyManualFg.propertyManualButton,
            this.customControls.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl,
            this.customControls.propertyInterpolatedFg.propertyInterpolatedCountNormalizeCtrl,
            this.customControls.propertyInterpolatedFg.propertyInterpolatedCountValueCtrl,
            this.customControls.propertyInterpolatedFg.propertyInterpolatedMetricCtrl,
            this.customControls.propertyInterpolatedFg.propertyInterpolatedFieldCtrl,
            this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl,
            this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeByKeyCtrl,
            this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeLocalFieldCtrl,
            this.customControls.propertyInterpolatedFg.propertyInterpolatedMinFieldValueCtrl,
            this.customControls.propertyInterpolatedFg.propertyInterpolatedMaxFieldValueCtrl,
            this.customControls.propertyInterpolatedFg.propertyInterpolatedValuesCtrl,
            this.customControls.propertyInterpolatedFg.propertyInterpolatedValuesButton,
            this.customControls.propertyInterpolatedFg.propertyInterpolatedValuesPreview,
            this.customControls.propertyInterpolatedFg.propertyInterpolatedMinValueCtrl,
            this.customControls.propertyInterpolatedFg.propertyInterpolatedMaxValueCtrl,
          ],
          resetDependantsOnChange: true,
          dependsOn: () => !!geometryTypeControl ? [geometryTypeControl()] : [],
          onDependencyChange: (control) => {
            if (!!geometryTypeControl) {
              if (geometryTypeControl().value === GEOMETRY_TYPE.heatmap) {
                (control as SelectFormControl).setSyncOptions(valuesToOptions([PROPERTY_SELECTOR_SOURCE.heatmap_density]));
              } else {
                (control as SelectFormControl).setSyncOptions(valuesToOptions(sources));
              }
            }
          }
        }
      ),
      propertyFix: propertyType === PROPERTY_TYPE.color ?
        new ColorFormControl(
          '',
          marker('Fixed') + ' ' + propertyName,
          marker('Color fixed description'),
          {
            dependsOn: () => [this.customControls.propertySource],
            onDependencyChange: (control) => control.enableIf(this.customControls.propertySource.value === PROPERTY_SELECTOR_SOURCE.fix)
          }
        ) :
        new SliderFormControl(
          '',
          marker('Fixed') + ' ' + propertyName,
          marker('Slider fixed value description') + ' ' + propertyName,
          defaultConfig[propertyName + 'Min'],
          defaultConfig[propertyName + 'Max'],
          defaultConfig[propertyName + 'Step'],
          undefined,
          undefined,
          {
            dependsOn: () => [this.customControls.propertySource],
            onDependencyChange: (control) => control.enableIf(this.customControls.propertySource.value === PROPERTY_SELECTOR_SOURCE.fix)
          }
        ),
      propertyProvidedFieldCtrl: new SelectFormControl(
        '',
        marker('Provided field'),
        marker('Provided source field description'),
        true,
        toKeywordOptionsObs(collectionFieldsObs),
        {
          dependsOn: () => [this.customControls.propertySource],
          onDependencyChange: (control) =>
            control.enableIf(this.customControls.propertySource.value === PROPERTY_SELECTOR_SOURCE.provided)
        }
      ),
      propertyProvidedFieldLabelCtrl: new SelectFormControl(
        '',
        marker('Label field'),
        marker('label field description'),
        true,
        toTextOrKeywordOptionsObs(collectionFieldsObs),
        {
          dependsOn: () => [this.customControls.propertySource],
          onDependencyChange: (control) =>
            control.enableIf(this.customControls.propertySource.value === PROPERTY_SELECTOR_SOURCE.provided),
          optional: true
        }
      ),
      propertyGeneratedFieldCtrl: new SelectFormControl(
        '',
        marker('Generated color field'),
        marker('Generated source field description'),
        true,
        toKeywordOptionsObs(collectionFieldsObs),
        {
          dependsOn: () => [this.customControls.propertySource],
          onDependencyChange: (control) =>
            control.enableIf(this.customControls.propertySource.value === PROPERTY_SELECTOR_SOURCE.generated)
        }
      ),
      propertyManualFg: new ConfigFormGroup({
        propertyManualFieldCtrl: new SelectFormControl(
          '',
          marker('Source field'),
          marker('Manual source field description'),
          true,
          toKeywordOptionsObs(collectionFieldsObs),
          {
            resetDependantsOnChange: true
          }
        ),
        propertyManualButton: new ButtonFormControl(
          '',
          marker('Manage colors'),
          marker('Manage colors description'),
          () => dialog.open(DialogColorTableComponent, {
            data: {
              collection: this.collection,
              sourceField: this.customControls.propertyManualFg.propertyManualFieldCtrl.value,
              keywordColors: this.customControls.propertyManualFg.propertyManualValuesCtrl.value
            } as DialogColorTableData,
            autoFocus: false,
          })
            .afterClosed().subscribe((result: Array<KeywordColor>) => {
              if (result !== undefined) {
                this.customControls.propertyManualFg.propertyManualValuesCtrl.clear();
                result.forEach((kc: KeywordColor) => {
                  /** after closing the dialog, save the [keyword, color] list in the Arlas color service */
                  colorService.updateKeywordColor(kc.keyword, kc.color);
                  this.addToColorManualValuesCtrl(kc);
                });
              }
            }),
          undefined,
          {
            optional: true,
            dependsOn: () => [this.customControls.propertyManualFg.propertyManualFieldCtrl],
            onDependencyChange: (control) => {
              /** this code block, is triggered when we change the Manual field control  */
              const field = this.customControls.propertyManualFg.propertyManualFieldCtrl.value;
              control.enableIf(!!field);
              /** the keywords are added to keysToColors list of ArlasColorGeneratorLoader
               *  service, so there is no need to keep them in `propertyManualValuesCtrl`  ==>
               *  clear old keywords from `propertyManualValuesCtrl` list in order and keep only keywords
               *  obtained from the chosen `propertyManualFieldCtrl`
               */
              this.customControls.propertyManualFg.propertyManualValuesCtrl.clear();
              if (!!field) {
                collectionService.getTermAggregation(this.collection, field).then((keywords: Array<string>) => {
                  const existingKeywords =
                    (this.customControls.propertyManualFg.propertyManualValuesCtrl.value as Array<KeywordColor>)
                      .map(v => v.keyword);
                  [...keywords, 'OTHER']
                    .filter(k => existingKeywords.indexOf(k) < 0)
                    .forEach((k: string) => {
                      this.addToColorManualValuesCtrl({ keyword: k, color: colorService.getColor(k) });
                    });
                });
              }
            }
          }
        ),
        propertyManualValuesCtrl: new FormArray([], Validators.required)
      },
        {
          dependsOn: () => [this.customControls.propertySource],
          onDependencyChange: (control) =>
            control.enableIf(this.customControls.propertySource.value === PROPERTY_SELECTOR_SOURCE.manual)
        }),
      propertyInterpolatedFg: new ConfigFormGroup({
        propertyInterpolatedCountOrMetricCtrl: new ButtonToggleFormControl(
          '',
          [
            { label: marker('Count'), value: COUNT_OR_METRIC.COUNT },
            { label: marker('Metric'), value: COUNT_OR_METRIC.METRIC },
          ],
          'Interpolated ' + propertyName + ' description',
          {
            resetDependantsOnChange: true,
            dependsOn: () => [this.customControls.propertySource],
            onDependencyChange: (control) => control.enableIf(
              this.customControls.propertySource.value !== PROPERTY_SELECTOR_SOURCE.heatmap_density && isAggregated)
          }
        ),
        propertyInterpolatedCountNormalizeCtrl: new SlideToggleFormControl(
          '',
          marker('Normalize'),
          '',
          {
            dependsOn: () => [
              this.customControls.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl,
              this.customControls.propertySource
            ],
            onDependencyChange: (control) => control.enableIf(
              this.customControls.propertySource.value !== PROPERTY_SELECTOR_SOURCE.heatmap_density
              && isAggregated
              && this.customControls.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl.value === COUNT_OR_METRIC.COUNT)
          }
        ),
        propertyInterpolatedCountValueCtrl: new HiddenFormControl(
          '',
          'undefined',
          {
            dependsOn: () => [this.customControls.propertyInterpolatedFg.propertyInterpolatedCountNormalizeCtrl],
            onDependencyChange: (control) => {
                if (!!this.collection) {
                  collectionService.countNbDocuments(this.collection).subscribe(
                    count => control.setValue(count.totalnb)
                  );
                }
              }
          }
        ),
        propertyInterpolatedMetricCtrl: new SelectFormControl(
          '',
          marker('map metric'),
          '',
          false,
          [METRIC_TYPES.AVG, METRIC_TYPES.SUM, METRIC_TYPES.MIN, METRIC_TYPES.MAX]
            .map(m => ({ label: m, value: m })),
          {
            dependsOn: () => [this.customControls.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl],
            onDependencyChange: (control) => control.enableIf(
              isAggregated &&
              this.customControls.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl.value === COUNT_OR_METRIC.METRIC)
          }
        ),
        propertyInterpolatedFieldCtrl: new SelectFormControl(
          '',
          marker('Interpolation field'),
          marker('Interpolated source field description') + ' ' + propertyName,
          true,
          toNumericOrDateOptionsObs(collectionFieldsObs),
          {
            resetDependantsOnChange: true,
            dependsOn: () => [
              this.customControls.propertyInterpolatedFg.propertyInterpolatedMetricCtrl,
              this.customControls.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl
            ],
            onDependencyChange: (control) => {
              control.enableIf(
                !isAggregated
                || this.customControls.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl.value === COUNT_OR_METRIC.METRIC &&
                !!this.customControls.propertyInterpolatedFg.propertyInterpolatedMetricCtrl.value);
            }
          }
        ),
        propertyInterpolatedNormalizeCtrl: new SlideToggleFormControl(
          '',
          marker('Normalize'),
          '',
          {
            dependsOn: () => [
              this.customControls.propertyInterpolatedFg.propertyInterpolatedFieldCtrl,
              this.customControls.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl
            ],
            onDependencyChange: (control) => control.enableIf(
              !isAggregated && this.customControls.propertyInterpolatedFg.propertyInterpolatedFieldCtrl.value ||
              this.customControls.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl.value === COUNT_OR_METRIC.METRIC &&
              !!this.customControls.propertyInterpolatedFg.propertyInterpolatedFieldCtrl.value),
            resetDependantsOnChange: true
          }
        ),
        propertyInterpolatedNormalizeByKeyCtrl: new SlideToggleFormControl(
          '',
          marker('Normalize by key?'),
          marker('Normalize by key description'),
          {
            resetDependantsOnChange: true,
            dependsOn: () =>
              [
                this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl,
                this.customControls.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl
              ],
            onDependencyChange: (control) => control.enableIf(
              !isAggregated && !!this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl.value)
          }
        ),
        propertyInterpolatedNormalizeLocalFieldCtrl: new SelectFormControl(
          '',
          marker('Key'),
          marker('Normalize key field description'),
          true,
          toKeywordOptionsObs(collectionFieldsObs),
          {
            dependsOn: () => [
              this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeByKeyCtrl,
              this.customControls.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl
            ],
            onDependencyChange: (control) => control.enableIf(
              (!isAggregated ||
                this.customControls.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl.value === COUNT_OR_METRIC.METRIC)
              && !!this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeByKeyCtrl.value),
            resetDependantsOnChange: true
          }
        ),
        propertyInterpolatedMinFieldValueCtrl: new InputFormControl(
          '',
          marker('Minimum value'),
          '',
          'number',
          {
            resetDependantsOnChange: true,
            dependsOn: () => [
              this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl,
              this.customControls.propertyInterpolatedFg.propertyInterpolatedFieldCtrl,
              this.customControls.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl
            ],
            onDependencyChange: (control, isLoading) => {
              const doEnable =
                (!isAggregated ||
                  this.customControls.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl.value === COUNT_OR_METRIC.METRIC)
                && !this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl.value
                && !!this.customControls.propertyInterpolatedFg.propertyInterpolatedFieldCtrl.value;
              control.enableIf(doEnable);
              if (doEnable && !isLoading) {
                const allValuesCtr = this.customControls.propertyInterpolatedFg.propertyInterpolatedValuesCtrl;
                // if we import a config we take the min value already in the config, else we calculate the min of the field
                if (!!allValuesCtr.value && allValuesCtr.value.length > 2 &&
                  allValuesCtr.value[0].proportion + '' !== NaN.toString() &&
                  !this.customControls.propertyInterpolatedFg.propertyInterpolatedFieldCtrl.touched) {
                  control.setValue(+allValuesCtr.value[0].proportion);
                } else {
                  collectionService.getComputationMetric(
                    this.collection,
                    this.customControls.propertyInterpolatedFg.propertyInterpolatedFieldCtrl.value,
                    METRIC_TYPES.MIN)
                    .then(min =>
                      control.setValue(min));
                }
              }
            }
          }
        ),
        propertyInterpolatedMaxFieldValueCtrl: new InputFormControl(
          '',
          marker('Maximum value'),
          '',
          'number',
          {
            resetDependantsOnChange: true,
            dependsOn: () => [
              this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl,
              this.customControls.propertyInterpolatedFg.propertyInterpolatedFieldCtrl,
              this.customControls.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl
            ],
            onDependencyChange: (control, isLoading) => {
              const doEnable =
                (!isAggregated ||
                  this.customControls.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl.value === COUNT_OR_METRIC.METRIC)
                && !this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl.value
                && !!this.customControls.propertyInterpolatedFg.propertyInterpolatedFieldCtrl.value;
              control.enableIf(doEnable);
              if (doEnable && !isLoading) {
                const metric = this.customControls.propertyInterpolatedFg.propertyInterpolatedMetricCtrl.value === METRIC_TYPES.SUM ?
                  METRIC_TYPES.SUM : METRIC_TYPES.MAX;
                const allValuesCtr = this.customControls.propertyInterpolatedFg.propertyInterpolatedValuesCtrl;
                // if we import a config we take the max value already in the config, else we calculate the max of the field
                if (!!allValuesCtr.value && allValuesCtr.value.length > 2 &&
                  allValuesCtr.value[allValuesCtr.value.length - 1].proportion + '' !== NaN.toString()
                  && !this.customControls.propertyInterpolatedFg.propertyInterpolatedFieldCtrl.touched) {
                  control.setValue(+allValuesCtr.value[allValuesCtr.value.length - 1].proportion);
                } else {
                  collectionService.getComputationMetric(
                    this.collection,
                    this.customControls.propertyInterpolatedFg.propertyInterpolatedFieldCtrl.value,
                    metric)
                    .then(sum =>
                      control.setValue(sum));
                }
              }
            }
          }
        ),
        propertyInterpolatedValuesCtrl: new HiddenFormControl(
          '',
          // define label, used for error message, only for colors => otherwise interpolation is done automatically
          propertyType === PROPERTY_TYPE.color ? marker('A Palette') : undefined,
          {
            resetDependantsOnChange: true,
            dependsOn: () => [
              this.customControls.propertySource,
              this.customControls.propertyInterpolatedFg.propertyInterpolatedFieldCtrl,

              this.customControls.propertyInterpolatedFg.propertyInterpolatedMinFieldValueCtrl,
              this.customControls.propertyInterpolatedFg.propertyInterpolatedMaxFieldValueCtrl,
              this.customControls.propertyInterpolatedFg.propertyInterpolatedMinValueCtrl,
              this.customControls.propertyInterpolatedFg.propertyInterpolatedMaxValueCtrl,
              this.customControls.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl,
              this.customControls.propertyInterpolatedFg.propertyInterpolatedCountNormalizeCtrl,
            ],
            onDependencyChange: (control) => {
              // if propertyType is not color => create interpolation values from the min and max
              // (other the palette dialog will update the interpolation values)
              if (propertyType === PROPERTY_TYPE.number &&
                this.customControls.propertyInterpolatedFg.propertyInterpolatedMinValueCtrl.valid &&
                this.customControls.propertyInterpolatedFg.propertyInterpolatedMaxValueCtrl.valid) {
                const isAggregatedCount =
                  isAggregated &&
                  this.customControls.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl.value === COUNT_OR_METRIC.COUNT;
                const doNormalize =
                  this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl.value
                  || isAggregatedCount && !!this.customControls.propertyInterpolatedFg.propertyInterpolatedCountNormalizeCtrl.value;

                const minValue = doNormalize || isAggregatedCount ?
                  0.0 : parseFloat(this.customControls.propertyInterpolatedFg.propertyInterpolatedMinFieldValueCtrl.value);
                const maxValue = doNormalize ? 1.0 : isAggregatedCount ?
                  parseFloat(this.customControls.propertyInterpolatedFg.propertyInterpolatedCountValueCtrl.value) :
                  parseFloat(this.customControls.propertyInterpolatedFg.propertyInterpolatedMaxFieldValueCtrl.value);
                const minInterpolatedValue = this.customControls.propertyInterpolatedFg.propertyInterpolatedMinValueCtrl.value;
                const maxInterpolatedValue = this.customControls.propertyInterpolatedFg.propertyInterpolatedMaxValueCtrl.value;
                // if we import a config where we don't interpolate linearly, we will maintain this custom interpolation
                // as long as we don't change the dependants values : max, min, normalise. If we change those values, we lose
                // the custom interpolation
                if (!control.value || +control.value[0].proportion !== minValue ||
                  +control.value[control.value.length - 1].proportion !== maxValue ||
                  +control.value[0].value !== minInterpolatedValue ||
                  +control.value[control.value.length - 1].value !== maxInterpolatedValue) {
                  control.setValue(
                    [...Array(6).keys()].map(k =>
                      ({
                        proportion: minValue + (maxValue - minValue) * k / 5,
                        value: minInterpolatedValue + (maxInterpolatedValue - minInterpolatedValue) * k / 5
                      })
                    )
                  );
                }
                // enable if a color or a number can be interpolated
                this.enableControlIfColorInterpolable(control as ConfigFormControl, isAggregated, false);
              }
            }
          }
        ),
        propertyInterpolatedValuesButton: new ButtonFormControl(
          '',
          marker('Manage palette'),
          '',
          () => {
            const isAggregatedCount =
              isAggregated &&
              this.customControls.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl.value === COUNT_OR_METRIC.COUNT;
            const doNormalize =
              !isAggregatedCount && this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl.value
              || isAggregatedCount && !!this.customControls.propertyInterpolatedFg.propertyInterpolatedCountNormalizeCtrl.value;
            const isDensity = this.customControls.propertySource.value === PROPERTY_SELECTOR_SOURCE.heatmap_density;
            const min = doNormalize || isAggregatedCount || isDensity ?
              0 : parseFloat(this.customControls.propertyInterpolatedFg.propertyInterpolatedMinFieldValueCtrl.value);
            const max = doNormalize || isDensity ? 1 : isAggregatedCount ?
              this.customControls.propertyInterpolatedFg.propertyInterpolatedCountValueCtrl.value :
              parseFloat(this.customControls.propertyInterpolatedFg.propertyInterpolatedMaxFieldValueCtrl.value);

            // reset palette values if min or max not match the current min or max values
            const allValuesCtr = this.customControls.propertyInterpolatedFg.propertyInterpolatedValuesCtrl.value;
            if (!!allValuesCtr && (allValuesCtr[0].proportion !== min || allValuesCtr[allValuesCtr.length - 1].proportion !== max)) {
              this.customControls.propertyInterpolatedFg.propertyInterpolatedValuesCtrl.setValue(null);
            }
            const paletteData: DialogPaletteSelectorData = {
              min,
              max,
              defaultPalettes: defaultConfig.palettes,
              selectedPalette: this.customControls.propertyInterpolatedFg.propertyInterpolatedValuesCtrl.value
            };
            dialog.open(DialogPaletteSelectorComponent, {
              data: paletteData,
              autoFocus: false,
              panelClass: 'dialog-with-overflow'
            })
              .afterClosed().subscribe(result => {
                if (result !== undefined) {
                  this.customControls.propertyInterpolatedFg.propertyInterpolatedValuesCtrl.setValue(result);
                  this.customControls.propertyInterpolatedFg.propertyInterpolatedValuesCtrl.markAsDirty();
                }
              });
          },
          undefined,
          {
            optional: true,
            dependsOn: () => [
              this.customControls.propertySource,
              this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl,
              this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeByKeyCtrl,
              this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeLocalFieldCtrl,
              this.customControls.propertyInterpolatedFg.propertyInterpolatedMinFieldValueCtrl,
              this.customControls.propertyInterpolatedFg.propertyInterpolatedMaxFieldValueCtrl,
            ],
            onDependencyChange: (control) => this.enableControlIfColorInterpolable(control as ConfigFormControl, isAggregated, true)
          }
        ),
        propertyInterpolatedValuesPreview: new ColorPreviewFormControl(
          null,
          {
            dependsOn: () => [
              this.customControls.propertyInterpolatedFg.propertyInterpolatedValuesCtrl
            ],
            onDependencyChange: (control) => {
              const interpolatedValuesCtrl = this.customControls.propertyInterpolatedFg.propertyInterpolatedValuesCtrl;
              const hasInterpolatedValues = interpolatedValuesCtrl.enabled
                && !!interpolatedValuesCtrl.value
                && propertyType === PROPERTY_TYPE.color;
              control.enableIf(hasInterpolatedValues);
              control.setValue(interpolatedValuesCtrl.value);
            }
          }
        ),
        propertyInterpolatedMinValueCtrl: new SliderFormControl(
          '',
          marker('Minimum') + ' ' + propertyName,
          null,
          defaultConfig[propertyName + 'Min'],
          defaultConfig[propertyName + 'Max'],
          defaultConfig[propertyName + 'Step'],
          () => this.customControls.propertyInterpolatedFg.propertyInterpolatedMaxValueCtrl,
          undefined,
          {
            dependsOn: () => [
              this.customControls.propertyInterpolatedFg.propertyInterpolatedFieldCtrl,
              this.customControls.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl
            ],
            onDependencyChange: (control) => {
              control.enableIf(
                propertyType === PROPERTY_TYPE.number && (
                  !!this.customControls.propertyInterpolatedFg.propertyInterpolatedFieldCtrl.value ||
                  this.customControls.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl.value === COUNT_OR_METRIC.COUNT));
              if (!control.value && !control.touched && defaultConfig[propertyName + 'Min'] !== undefined) {
                control.setValue(defaultConfig[propertyName + 'Min']);
              }
            }

          }
        ),
        propertyInterpolatedMaxValueCtrl: new SliderFormControl(
          '',
          marker('Maximum') + ' ' + propertyName,
          null,
          defaultConfig[propertyName + 'Min'],
          defaultConfig[propertyName + 'Max'],
          defaultConfig[propertyName + 'Step'],
          undefined,
          () => this.customControls.propertyInterpolatedFg.propertyInterpolatedMinValueCtrl,
          {
            dependsOn: () => [
              this.customControls.propertyInterpolatedFg.propertyInterpolatedFieldCtrl,
              this.customControls.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl
            ],
            onDependencyChange: (control) => {
              control.enableIf(
                propertyType === PROPERTY_TYPE.number && (
                  !!this.customControls.propertyInterpolatedFg.propertyInterpolatedFieldCtrl.value ||
                  this.customControls.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl.value === COUNT_OR_METRIC.COUNT));
              if (!control.value && !control.touched && defaultConfig[propertyName + 'Max'] !== undefined) {
                control.setValue(defaultConfig[propertyName + 'Max']);
              }
            }
          }
        ),
      },
        {
          dependsOn: () => [this.customControls.propertySource],
          onDependencyChange: (control) =>
            control.enableIf(
              this.customControls.propertySource.value === PROPERTY_SELECTOR_SOURCE.interpolated
              || this.customControls.propertySource.value === PROPERTY_SELECTOR_SOURCE.heatmap_density)
        })
    });
  }

  public customControls = {
    propertySource: this.get('propertySource') as SelectFormControl,
    propertyFix: this.get('propertyFix') as ColorFormControl | SliderFormControl,
    propertyProvidedFieldCtrl: this.get('propertyProvidedFieldCtrl') as SelectFormControl,
    propertyProvidedFieldLabelCtrl: this.get('propertyProvidedFieldLabelCtrl') as SelectFormControl,
    propertyGeneratedFieldCtrl: this.get('propertyGeneratedFieldCtrl') as SelectFormControl,
    propertyManualFg: {
      propertyManualFieldCtrl: this.get('propertyManualFg').get('propertyManualFieldCtrl') as SelectFormControl,
      propertyManualButton: this.get('propertyManualFg').get('propertyManualButton') as ButtonFormControl,
      propertyManualValuesCtrl: this.get('propertyManualFg').get('propertyManualValuesCtrl') as FormArray,
    },
    propertyInterpolatedFg: {
      propertyInterpolatedCountOrMetricCtrl:
        this.get('propertyInterpolatedFg').get('propertyInterpolatedCountOrMetricCtrl') as SlideToggleFormControl,
      propertyInterpolatedCountNormalizeCtrl:
        this.get('propertyInterpolatedFg').get('propertyInterpolatedCountNormalizeCtrl') as SlideToggleFormControl,
      propertyInterpolatedCountValueCtrl:
        this.get('propertyInterpolatedFg').get('propertyInterpolatedCountValueCtrl') as HiddenFormControl,
      propertyInterpolatedMetricCtrl:
        this.get('propertyInterpolatedFg').get('propertyInterpolatedMetricCtrl') as SelectFormControl,
      propertyInterpolatedFieldCtrl:
        this.get('propertyInterpolatedFg').get('propertyInterpolatedFieldCtrl') as SelectFormControl,
      propertyInterpolatedNormalizeCtrl:
        this.get('propertyInterpolatedFg').get('propertyInterpolatedNormalizeCtrl') as SlideToggleFormControl,
      propertyInterpolatedNormalizeByKeyCtrl:
        this.get('propertyInterpolatedFg').get('propertyInterpolatedNormalizeByKeyCtrl') as SlideToggleFormControl,
      propertyInterpolatedNormalizeLocalFieldCtrl:
        this.get('propertyInterpolatedFg').get('propertyInterpolatedNormalizeLocalFieldCtrl') as SelectFormControl,
      propertyInterpolatedMinFieldValueCtrl:
        this.get('propertyInterpolatedFg').get('propertyInterpolatedMinFieldValueCtrl') as InputFormControl,
      propertyInterpolatedMaxFieldValueCtrl:
        this.get('propertyInterpolatedFg').get('propertyInterpolatedMaxFieldValueCtrl') as InputFormControl,
      propertyInterpolatedValuesCtrl:
        this.get('propertyInterpolatedFg').get('propertyInterpolatedValuesCtrl') as HiddenFormControl,
      propertyInterpolatedValuesButton:
        this.get('propertyInterpolatedFg').get('propertyInterpolatedValuesButton') as SliderFormControl,
      propertyInterpolatedValuesPreview:
        this.get('propertyInterpolatedFg').get('propertyInterpolatedValuesPreview') as ColorPreviewFormControl,
      propertyInterpolatedMinValueCtrl:
        this.get('propertyInterpolatedFg').get('propertyInterpolatedMinValueCtrl') as SliderFormControl,
      propertyInterpolatedMaxValueCtrl:
        this.get('propertyInterpolatedFg').get('propertyInterpolatedMaxValueCtrl') as ButtonFormControl
    }
  };

  /**
   * Enable the "Manage palette" button and its related hidden field
   * => this method helps only to avoid code duplication
   */
  private enableControlIfColorInterpolable(control: ConfigFormControl, isAggregated: boolean, onlyColor: boolean) {
    let doEnable = false;
    if (onlyColor && this.propertyType !== PROPERTY_TYPE.color) {
      // NOP
    } else if (this.customControls.propertySource.value === PROPERTY_SELECTOR_SOURCE.heatmap_density) {
      doEnable = true;
    } else if (isAggregated &&
      this.customControls.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl.value === COUNT_OR_METRIC.COUNT) {
      doEnable = true;
    } else if (!this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl.value
      && !Number.isNaN(parseFloat(this.customControls.propertyInterpolatedFg.propertyInterpolatedMinFieldValueCtrl.value))
      && !Number.isNaN(parseFloat(this.customControls.propertyInterpolatedFg.propertyInterpolatedMaxFieldValueCtrl.value))) {
      doEnable = true;
    } else if (!!this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl.value
      && !this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeByKeyCtrl.value) {
      doEnable = true;
    } else if (!!this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl.value
      && this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeByKeyCtrl.value
      && !!this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeLocalFieldCtrl.value) {
      doEnable = true;
    }
    control.enableIf(doEnable);
  }

  /** Adds the [keyword, color] pair to `propertyManualValuesCtrl` */
  public addToColorManualValuesCtrl(kc: KeywordColor) {
    const keywordColorGrp = new FormGroup({
      keyword: new FormControl(kc.keyword),
      color: new FormControl(kc.color)
    });
    this.customControls.propertyManualFg.propertyManualValuesCtrl.push(keywordColorGrp);
  }

}

@Injectable({
  providedIn: 'root'
})
export class PropertySelectorFormBuilderService {

  constructor(
    private defaultValuesService: DefaultValuesService,
    private dialog: MatDialog,
    private collectionService: CollectionService,
    private colorService: ArlasColorGeneratorLoader
  ) { }

  public build(
    propertyType: PROPERTY_TYPE,
    propertyName: string,
    sources: Array<PROPERTY_SELECTOR_SOURCE>,
    isAggregated: boolean,
    collection: string,
    description?: string,
    geometryTypeControl?: () => SelectFormControl) {

    return new PropertySelectorFormGroup(
      this.defaultValuesService.getDefaultConfig(),
      this.dialog,
      this.collectionService,
      this.colorService,
      collection,
      this.collectionService.getCollectionFields(collection),
      propertyType,
      propertyName,
      sources,
      isAggregated,
      description,
      geometryTypeControl
    );
  }
}
