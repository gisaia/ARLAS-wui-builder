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
import { CustomValidators } from '@utils/custom-validators';
import { PROPERTY_SELECTOR_SOURCE, PROPERTY_TYPE } from '@shared-components/property-selector/models';
import {
  ConfigFormGroup, SelectFormControl, ColorFormControl, SliderFormControl, ButtonFormControl,
  SlideToggleFormControl,
  InputFormControl,
  HiddenFormControl
} from '@shared-models/config-form';
import { DefaultConfig, DefaultValuesService } from '@services/default-values/default-values.service';
import { toKeywordOptionsObs, toIntegerOptionsObs } from '@services/collection-service/tools';
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
export class NewPropertySelectorFormGroup extends ConfigFormGroup {

  constructor(
    defaultConfig: DefaultConfig,
    dialog: MatDialog,
    collectionService: CollectionService,
    colorService: ArlasColorGeneratorLoader,
    collection: string,
    collectionFieldsObs: Observable<Array<CollectionField>>,
    propertyType: PROPERTY_TYPE,
    propertyName: string,
    sources: Array<PROPERTY_SELECTOR_SOURCE>
  ) {
    super({
      propertySource: new SelectFormControl(
        '',
        propertyName,
        'description',
        false,
        sources.map(s => ({ label: s, value: s })),
        {
          childs: () => [
            this.customControls.propertyFix,
            this.customControls.propertyProvidedFieldCtrl,
            this.customControls.propertyGeneratedFieldCtrl,
            this.customControls.propertyManualFg.propertyManualFieldCtrl,
            this.customControls.propertyManualFg.propertyManualButton,
            this.customControls.propertyInterpolatedFg.propertyInterpolatedFieldCtrl,
            this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl,
            this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeByKeyCtrl,
            this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeLocalFieldCtrl,
            this.customControls.propertyInterpolatedFg.propertyInterpolatedMinFieldValueCtrl,
            this.customControls.propertyInterpolatedFg.propertyInterpolatedMaxFieldValueCtrl,
            ...propertyType === PROPERTY_TYPE.color ? [
              this.customControls.propertyInterpolatedFg.propertyInterpolatedValuesCtrl,
              this.customControls.propertyInterpolatedFg.propertyInterpolatedValuesButton,
            ] : [
                this.customControls.propertyInterpolatedFg.propertyInterpolatedMinValueCtrl,
                this.customControls.propertyInterpolatedFg.propertyInterpolatedMaxValueCtrl,
              ],
          ],
          resetDependantsOnChange: true
        }
      ),
      propertyFix: propertyType === PROPERTY_TYPE.color ?
        new ColorFormControl(
          '',
          'Fixed ' + propertyName,
          'description',
          {
            dependsOn: () => [this.customControls.propertySource],
            onDependencyChange: (control) =>
              this.customControls.propertySource.value === PROPERTY_SELECTOR_SOURCE.fix ? control.enable() : control.disable()
          }
        ) :
        new SliderFormControl(
          'Fixed ' + propertyName,
          propertyName,
          'Description',
          defaultConfig[propertyName + 'Min'],
          defaultConfig[propertyName + 'Max'],
          defaultConfig[propertyName + 'Step'],
          undefined,
          undefined,
          {
            dependsOn: () => [this.customControls.propertySource],
            onDependencyChange: (control) =>
              this.customControls.propertySource.value === PROPERTY_SELECTOR_SOURCE.fix ? control.enable() : control.disable()
          }
        ),
      propertyProvidedFieldCtrl: new SelectFormControl(
        '',
        'Source field',
        'Description',
        true,
        toKeywordOptionsObs(collectionFieldsObs),
        {
          dependsOn: () => [this.customControls.propertySource],
          onDependencyChange: (control) =>
            this.customControls.propertySource.value === PROPERTY_SELECTOR_SOURCE.provided ? control.enable() : control.disable()
        }
      ),
      propertyGeneratedFieldCtrl: new SelectFormControl(
        '',
        'Source field',
        'Description',
        true,
        toKeywordOptionsObs(collectionFieldsObs),
        {
          dependsOn: () => [this.customControls.propertySource],
          onDependencyChange: (control) =>
            this.customControls.propertySource.value === PROPERTY_SELECTOR_SOURCE.generated ? control.enable() : control.disable()
        }
      ),
      propertyManualFg: new ConfigFormGroup({
        propertyManualFieldCtrl: new SelectFormControl(
          '',
          'Source field',
          'Description',
          true,
          toKeywordOptionsObs(collectionFieldsObs),
          {
            resetDependantsOnChange: true
          }
        ),
        propertyManualButton: new ButtonFormControl(
          '',
          'Manage colors',
          'Description',
          () => dialog.open(DialogColorTableComponent, {
            data: {
              collection: 'demo_ais-danmark',
              sourceField: this.customControls.propertyManualFg.propertyManualFieldCtrl.value,
              keywordColors: this.customControls.propertyManualFg.propertyManualValuesCtrl.value
            } as DialogColorTableData,
            autoFocus: false,
          })
            .afterClosed().subscribe((result: Array<KeywordColor>) => {
              if (result !== undefined) {
                this.customControls.propertyManualFg.propertyManualValuesCtrl.clear();
                result.forEach((k: KeywordColor) => {
                  this.addToColorManualValuesCtrl(k);
                });
              }
            }),
          {
            optional: true,
            dependsOn: () => [this.customControls.propertyManualFg.propertyManualFieldCtrl],
            onDependencyChange: (control) => {
              const field = this.customControls.propertyManualFg.propertyManualFieldCtrl.value;
              this.customControls.propertyManualFg.propertyManualValuesCtrl.clear();

              if (field) {
                control.enable();
                collectionService.getTermAggregation(collection, field).then((keywords: Array<string>) => {
                  keywords.forEach((k: string) => {
                    this.addToColorManualValuesCtrl({
                      keyword: k,
                      color: colorService.getColor(k)
                    });
                  });
                  this.addToColorManualValuesCtrl({
                    keyword: 'OTHER',
                    color: defaultConfig.otherColor
                  });
                });

              } else {
                control.disable();
              }
            }
          }
        ),
        propertyManualValuesCtrl: new FormArray([], Validators.required)
      },
        {
          dependsOn: () => [this.customControls.propertySource],
          onDependencyChange: (control) =>
            this.customControls.propertySource.value === PROPERTY_SELECTOR_SOURCE.manual ?
              this.customControls.propertyManualFg.propertyManualFieldCtrl.enable() : control.disable()
        }),
      propertyInterpolatedFg: new ConfigFormGroup({
        // TODO if aggregated
        propertyInterpolatedFieldCtrl: new SelectFormControl(
          '',
          'Source field',
          'Description',
          true,
          toIntegerOptionsObs(collectionFieldsObs),
          {
            resetDependantsOnChange: true
          }
        ),
        propertyInterpolatedNormalizeCtrl: new SlideToggleFormControl(
          '',
          'Normalize',
          'Description',
          undefined,
          {
            dependsOn: () => [this.customControls.propertyInterpolatedFg.propertyInterpolatedFieldCtrl],
            onDependencyChange: (control) => !!this.customControls.propertyInterpolatedFg.propertyInterpolatedFieldCtrl.value ?
              control.enable() : control.disable(),
            resetDependantsOnChange: true
          }
        ),
        propertyInterpolatedNormalizeByKeyCtrl: new SlideToggleFormControl(
          '',
          'Normalize by key?',
          'Description',
          undefined,
          {
            dependsOn: () => [this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl],
            onDependencyChange: (control) => !!this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl.value ?
              control.enable() : control.disable()
          }
        ),
        propertyInterpolatedNormalizeLocalFieldCtrl: new SelectFormControl(
          '',
          'Key',
          'Description',
          true,
          toKeywordOptionsObs(collectionFieldsObs),
          {
            dependsOn: () => [this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeByKeyCtrl],
            onDependencyChange: (control) => !!this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeByKeyCtrl.value ?
              control.enable() : control.disable(),
            resetDependantsOnChange: true
          }
        ),
        propertyInterpolatedMinFieldValueCtrl: new InputFormControl(
          '',
          'Minimum value',
          'Description',
          'number',
          {
            dependsOn: () => [
              this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl,
              this.customControls.propertyInterpolatedFg.propertyInterpolatedFieldCtrl
            ],
            onDependencyChange: (control) => {
              if (!this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl.value
                && !!this.customControls.propertyInterpolatedFg.propertyInterpolatedFieldCtrl.value) {

                control.enable();

                collectionService.getComputationMetric(
                  collection,
                  this.customControls.propertyInterpolatedFg.propertyInterpolatedFieldCtrl.value,
                  METRIC_TYPES.MIN)
                  .then(min =>
                    control.setValue(min));

              } else {
                control.disable();
              }
            }
          }
        ),
        propertyInterpolatedMaxFieldValueCtrl: new InputFormControl(
          '',
          'Minimum value',
          'Description',
          'number',
          {
            dependsOn: () => [
              this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl,
              this.customControls.propertyInterpolatedFg.propertyInterpolatedFieldCtrl
            ],
            onDependencyChange: (control) => {
              if (!this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl.value
                && !!this.customControls.propertyInterpolatedFg.propertyInterpolatedFieldCtrl.value) {

                control.enable();

                const metric = this.customControls.propertyInterpolatedFg.propertyInterpolatedMetricCtrl.value === METRIC_TYPES.SUM ?
                  METRIC_TYPES.SUM : METRIC_TYPES.MAX;

                collectionService.getComputationMetric(
                  collection,
                  this.customControls.propertyInterpolatedFg.propertyInterpolatedFieldCtrl.value,
                  metric)
                  .then(sum =>
                    control.setValue(sum));

              } else {
                control.disable();
              }
            }
          }
        ),
        ...propertyType === PROPERTY_TYPE.color ? {
          propertyInterpolatedValuesCtrl: new HiddenFormControl(
            '',
            {
              optional: propertyType !== PROPERTY_TYPE.color
            }
          ),
          propertyInterpolatedValuesButton: new ButtonFormControl(
            '',
            'Manage palette',
            'Description',
            () => {
              const paletteData: DialogPaletteSelectorData = {
                min: this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl.value ?
                  0 : parseInt(this.customControls.propertyInterpolatedFg.propertyInterpolatedMinFieldValueCtrl.value, 10),
                max: this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl.value ?
                  1 : parseInt(this.customControls.propertyInterpolatedFg.propertyInterpolatedMaxFieldValueCtrl.value, 10),
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
            {
              dependsOn: () => [
                this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeByKeyCtrl,
                this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeByKeyCtrl,
                this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeLocalFieldCtrl,
                this.customControls.propertyInterpolatedFg.propertyInterpolatedMinFieldValueCtrl,
                this.customControls.propertyInterpolatedFg.propertyInterpolatedMaxFieldValueCtrl,
              ],
              onDependencyChange: (control) => {
                if (!this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl.value
                  && !Number.isNaN(parseInt(this.customControls.propertyInterpolatedFg.propertyInterpolatedMinFieldValueCtrl.value, 10))
                  && !Number.isNaN(parseInt(this.customControls.propertyInterpolatedFg.propertyInterpolatedMaxFieldValueCtrl.value, 10))) {
                  control.enable();
                } else if (!!this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl.value
                  && !this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeByKeyCtrl.value) {
                  control.enable();
                } else if (!!this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl.value
                  && this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeByKeyCtrl.value
                  && !!this.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeLocalFieldCtrl.value) {
                  control.enable();
                } else {
                  control.disable();
                }
              }
            }
          )
        } : {
            propertyInterpolatedMinValueCtrl: new SliderFormControl(
              '',
              'Minimum ' + propertyName,
              'description',
              defaultConfig[propertyName + 'Min'],
              defaultConfig[propertyName + 'Max'],
              defaultConfig[propertyName + 'Step'],
              () => this.customControls.propertyInterpolatedFg.propertyInterpolatedMaxValueCtrl,
              undefined
            ),
            propertyInterpolatedMaxValueCtrl: new SliderFormControl(
              '',
              'Maximum ' + propertyName,
              'description',
              defaultConfig[propertyName + 'Min'],
              defaultConfig[propertyName + 'Max'],
              defaultConfig[propertyName + 'Step'],
              undefined,
              () => this.customControls.propertyInterpolatedFg.propertyInterpolatedMinValueCtrl
            ),

          },

      },
        {
          dependsOn: () => [this.customControls.propertySource],
          onDependencyChange: (control) =>
            this.customControls.propertySource.value === PROPERTY_SELECTOR_SOURCE.interpolated ?
              control.enable() : control.disable()
        })

    });
  }

  public customControls = {
    propertySource: this.get('propertySource') as SelectFormControl,
    propertyFix: this.get('propertyFix') as ColorFormControl | SliderFormControl,
    propertyProvidedFieldCtrl: this.get('propertyProvidedFieldCtrl') as SelectFormControl,
    propertyGeneratedFieldCtrl: this.get('propertyGeneratedFieldCtrl') as SelectFormControl,
    propertyManualFg: {
      propertyManualFieldCtrl: this.get('propertyManualFg').get('propertyManualFieldCtrl') as SelectFormControl,
      propertyManualButton: this.get('propertyManualFg').get('propertyManualButton') as ButtonFormControl,
      propertyManualValuesCtrl: this.get('propertyManualFg').get('propertyManualValuesCtrl') as FormArray,
    },
    propertyInterpolatedFg: {
      propertyInterpolatedFieldCtrl: this.get('propertyInterpolatedFg').get('propertyInterpolatedFieldCtrl') as SelectFormControl,
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
      propertyInterpolatedMinValueCtrl:
        this.get('propertyInterpolatedFg').get('propertyInterpolatedMinValueCtrl') as SliderFormControl,
      propertyInterpolatedMaxValueCtrl:
        this.get('propertyInterpolatedFg').get('propertyInterpolatedMaxValueCtrl') as ButtonFormControl,
      propertyInterpolatedMetricCtrl: new FormControl() // TODO,
    }
  };

  private addToColorManualValuesCtrl(kc: KeywordColor) {
    const keywordColorGrp = new FormGroup({
      keyword: new FormControl(kc.keyword),
      color: new FormControl(kc.color)
    });
    this.customControls.propertyManualFg.propertyManualValuesCtrl.push(keywordColorGrp);
  }

}

export class PropertySelectorFormGroup extends FormGroup {

  constructor(
    aggregated: boolean,
    propertyType: PROPERTY_TYPE
  ) {

    super({
      propertySource: new FormControl(
        null,
        Validators.required
      ),
      propertyFix: new FormControl(
        null
      ),
      propertyProvidedFieldCtrl: new FormControl(
        null
      ),
      propertyGeneratedFieldCtrl: new FormControl(
        null
      ),
      propertyManualFg: new FormGroup({
        propertyManualFieldCtrl: new FormControl(
          null
        ),
        propertyManualValuesCtrl: new FormArray(
          []
        )
      }),
      propertyInterpolatedFg: new FormGroup({
        propertyInterpolatedCountOrMetricCtrl: new FormControl(
          null
        ),
        propertyInterpolatedCountNormalizeCtrl: new FormControl(

        ),
        propertyInterpolatedMetricCtrl: new FormControl(
          null
        ),
        propertyInterpolatedFieldCtrl: new FormControl(
          null
        ),
        propertyInterpolatedNormalizeCtrl: new FormControl(
          null
        ),
        propertyInterpolatedNormalizeByKeyCtrl: new FormControl(
          null
        ),
        propertyInterpolatedNormalizeLocalFieldCtrl: new FormControl(
          null
        ),
        propertyInterpolatedMinFieldValueCtrl: new FormControl(
          null
        ),
        propertyInterpolatedMaxFieldValueCtrl: new FormControl(
          null
        ),
        propertyInterpolatedMinValueCtrl: new FormControl(
          null
        ),
        propertyInterpolatedMaxValueCtrl: new FormControl(
          null
        ),
        propertyInterpolatedValuesCtrl: new FormControl(
          null
        )
      }),
      propertyPointCountNormalized: new FormGroup({})
    });

    this.propertyFix.setValidators(
      CustomValidators.getConditionalValidator(() =>
        this.propertySource.value === PROPERTY_SELECTOR_SOURCE.fix,
        Validators.required)
    );

    this.propertyProvidedFieldCtrl.setValidators(
      CustomValidators.getConditionalValidator(() =>
        this.propertySource.value === PROPERTY_SELECTOR_SOURCE.provided,
        Validators.required)
    );

    this.propertyGeneratedFieldCtrl.setValidators(
      CustomValidators.getConditionalValidator(() =>
        this.propertySource.value === PROPERTY_SELECTOR_SOURCE.generated,
        Validators.required)
    );

    this.propertyManualFieldCtrl.setValidators(
      CustomValidators.getConditionalValidator(() =>
        this.propertySource.value === PROPERTY_SELECTOR_SOURCE.manual,
        Validators.required)
    );

    this.propertyInterpolatedFg.setValidators(
      CustomValidators.getConditionalValidator(() =>
        this.propertySource.value === PROPERTY_SELECTOR_SOURCE.interpolated && this.propertyInterpolatedFieldCtrl.value
        && this.propertyInterpolatedMinFieldValueCtrl.value && this.propertyInterpolatedMaxFieldValueCtrl.value,
        CustomValidators.getLTEValidator(
          'propertyInterpolatedMinFieldValueCtrl',
          'propertyInterpolatedMaxFieldValueCtrl'
        ))
    );

    this.propertyInterpolatedMetricCtrl.setValidators(
      CustomValidators.getConditionalValidator(() => aggregated &&
        this.propertySource.value === PROPERTY_SELECTOR_SOURCE.interpolated
        && this.propertyInterpolatedCountOrMetricCtrl.value,
        Validators.required)
    );

    this.propertyInterpolatedFieldCtrl.setValidators(
      CustomValidators.getConditionalValidator(() =>
        this.propertySource.value === PROPERTY_SELECTOR_SOURCE.interpolated
        && (!aggregated || aggregated && this.propertyInterpolatedMetricCtrl.value),
        Validators.required)
    );

    this.propertyInterpolatedNormalizeLocalFieldCtrl.setValidators(
      CustomValidators.getConditionalValidator(() => !aggregated &&
        this.propertySource.value === PROPERTY_SELECTOR_SOURCE.interpolated
        && this.propertyInterpolatedNormalizeByKeyCtrl.value,
        Validators.required)
    );

    this.propertyInterpolatedMinFieldValueCtrl.setValidators(
      CustomValidators.getConditionalValidator(() =>
        this.propertySource.value === PROPERTY_SELECTOR_SOURCE.interpolated
        && this.propertyInterpolatedFieldCtrl.value && !this.propertyInterpolatedNormalizeCtrl.value,
        Validators.required)
    );

    this.propertyInterpolatedMaxFieldValueCtrl.setValidators(
      CustomValidators.getConditionalValidator(() =>
        this.propertySource.value === PROPERTY_SELECTOR_SOURCE.interpolated
        && this.propertyInterpolatedFieldCtrl.value && !this.propertyInterpolatedNormalizeCtrl.value,
        Validators.required)
    );

    this.propertyInterpolatedMinValueCtrl.setValidators(
      CustomValidators.getConditionalValidator(() =>
        this.propertySource.value === PROPERTY_SELECTOR_SOURCE.interpolated
        && propertyType === PROPERTY_TYPE.number
        && this.propertyInterpolatedFieldCtrl.value && !this.propertyInterpolatedNormalizeCtrl.value,
        Validators.required)
    );

    this.propertyInterpolatedMaxValueCtrl.setValidators(
      CustomValidators.getConditionalValidator(() =>
        this.propertySource.value === PROPERTY_SELECTOR_SOURCE.interpolated
        && propertyType === PROPERTY_TYPE.number
        && this.propertyInterpolatedFieldCtrl.value && !this.propertyInterpolatedNormalizeCtrl.value,
        Validators.required)
    );

    this.propertyInterpolatedValuesCtrl.setValidators(
      CustomValidators.getConditionalValidator(() =>
        this.propertySource.value === PROPERTY_SELECTOR_SOURCE.interpolated
        && (this.propertyInterpolatedFieldCtrl.value ||
          aggregated && !this.propertyInterpolatedCountOrMetricCtrl.value),
        Validators.required)
    );
  }

  public get propertySource() { return this.get('propertySource'); }
  public get propertyFix() { return this.get('propertyFix'); }
  public get propertyProvidedFieldCtrl() { return this.get('propertyProvidedFieldCtrl'); }
  public get propertyGeneratedFieldCtrl() { return this.get('propertyGeneratedFieldCtrl'); }
  public get propertyManualFg() { return this.get('propertyManualFg'); }
  public get propertyManualFieldCtrl() { return this.propertyManualFg.get('propertyManualFieldCtrl'); }
  public get propertyManualValuesCtrl() { return this.propertyManualFg.get('propertyManualValuesCtrl'); }
  public get propertyInterpolatedFg() { return this.get('propertyInterpolatedFg'); }
  public get propertyInterpolatedCountOrMetricCtrl() { return this.propertyInterpolatedFg.get('propertyInterpolatedCountOrMetricCtrl'); }
  public get propertyInterpolatedCountNormalizeCtrl() { return this.propertyInterpolatedFg.get('propertyInterpolatedCountNormalizeCtrl'); }
  public get propertyInterpolatedMetricCtrl() { return this.propertyInterpolatedFg.get('propertyInterpolatedMetricCtrl'); }
  public get propertyInterpolatedFieldCtrl() { return this.propertyInterpolatedFg.get('propertyInterpolatedFieldCtrl'); }
  public get propertyInterpolatedNormalizeCtrl() { return this.propertyInterpolatedFg.get('propertyInterpolatedNormalizeCtrl'); }
  public get propertyInterpolatedNormalizeByKeyCtrl() { return this.propertyInterpolatedFg.get('propertyInterpolatedNormalizeByKeyCtrl'); }
  public get propertyInterpolatedNormalizeLocalFieldCtrl() {
    return this.propertyInterpolatedFg.get('propertyInterpolatedNormalizeLocalFieldCtrl');
  }
  public get propertyInterpolatedMinFieldValueCtrl() { return this.propertyInterpolatedFg.get('propertyInterpolatedMinFieldValueCtrl'); }
  public get propertyInterpolatedMaxFieldValueCtrl() { return this.propertyInterpolatedFg.get('propertyInterpolatedMaxFieldValueCtrl'); }
  public get propertyInterpolatedMinValueCtrl() { return this.propertyInterpolatedFg.get('propertyInterpolatedMinValueCtrl'); }
  public get propertyInterpolatedMaxValueCtrl() { return this.propertyInterpolatedFg.get('propertyInterpolatedMaxValueCtrl'); }
  public get propertyInterpolatedValuesCtrl() { return this.propertyInterpolatedFg.get('propertyInterpolatedValuesCtrl'); }
  public get propertyPointCountNormalized() { return this.get('propertyPointCountNormalized'); }

}

@Injectable({
  providedIn: 'root'
})
export class PropertySelectorFormBuilderService {

  constructor(
    private defaultValuesService: DefaultValuesService,
    private dialog: MatDialog,
    private collectionService: CollectionService,
    private colorService: ArlasColorGeneratorLoader,
    private mainFormService: MainFormService
  ) { }

  public build(
    aggregated: boolean,
    propertyType: PROPERTY_TYPE
  ) {
    return new PropertySelectorFormGroup(aggregated, propertyType);
  }

  public buildNew(
    propertyType: PROPERTY_TYPE,
    propertyName: string,
    sources: Array<PROPERTY_SELECTOR_SOURCE>) {

    return new NewPropertySelectorFormGroup(
      this.defaultValuesService.getDefaultConfig(),
      this.dialog,
      this.collectionService,
      this.colorService,
      this.mainFormService.getCollections()[0],
      this.collectionService.getCollectionFields(this.mainFormService.getCollections()[0]),
      propertyType,
      propertyName,
      sources
    );
  }
}
