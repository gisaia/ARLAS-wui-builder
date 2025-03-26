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
import {
  EditResultlistQuicklookComponent
} from '@analytics-config/components/edit-resultlist-quicklook/edit-resultlist-quicklook.component';
import { ResultlistDataComponent } from '@analytics-config/components/resultlist-data/resultlist-data.component';
import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { marker } from '@colsen1991/ngx-translate-extract-marker';
import { DialogColorTableComponent } from '@map-config/components/dialog-color-table/dialog-color-table.component';
import { DialogColorTableData, KeywordColor } from '@map-config/components/dialog-color-table/models';
import { CollectionService } from '@services/collection-service/collection.service';
import { CollectionField } from '@services/collection-service/models';
import { FILTER_OPERATION } from '@map-config/services/map-layer-form-builder/models';
import {
  NUMERIC_OR_DATE_OR_KEYWORD,
  NUMERIC_OR_DATE_OR_TEXT_TYPES,
  TEXT_OR_KEYWORD,
    toNumericOrDateOrKeywordOrBooleanObs,
  toNumericOrDateOrKeywordOrTextObs,
  toOptionsObs
} from '@services/collection-service/tools';
import { DefaultConfig, DefaultValuesService } from '@services/default-values/default-values.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';
import { CollectionConfigFormGroup } from '@shared-models/collection-config-form';
import {
  ButtonFormControl,
  ComponentFormControl,
  ConfigFormGroup,
  FieldTemplateControl,
  HiddenFormControl,
  InputFormControl,
  MultipleSelectFormControl,
  SelectFormControl,
  SelectOption,
  SliderFormControl,
  SlideToggleFormControl,
  TextareaFormControl,
  TitleInputFormControl,
    FieldTemplateControl,
    ButtonToggleFormControl, TypedSelectFormControl,
    ConfigFormControl
} from '@shared-models/config-form';
import { valuesToOptions } from '@utils/tools';

import { WidgetConfigFormGroup } from '@shared-models/widget-config-form';
import { ArlasColorService } from 'arlas-web-components';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { Observable } from 'rxjs';
import { WidgetFormBuilder } from '../widget-form-builder';
import {
    EditResultlistVisualisationComponent
} from '@analytics-config/components/edit-resultlist-visualisation/edit-resultlist-visualisation.component';

export class ResultlistConfigForm extends WidgetConfigFormGroup {

  public constructor(
    collection: string,
    collectionService: CollectionService,
    title?: string,
    options?: any
  ) {
    super(
      collection,
      {
        title: new InputFormControl(
          !!title ? title : '',
          marker('resultlist title'),
          marker('resultlist title description'),
          undefined,
          {
            childs: () => [this.customControls.dataStep.idFieldName]
          }
        ),
        icon: new HiddenFormControl(
          !!options && !!options.icon ? options.icon : 'short_text',
          ''
        ),
        showName: new HiddenFormControl(
          !!options && !!options.showName ? options.showName : true
        ),
        showIcon: new HiddenFormControl(
          !!options && !!options.showIcon ? options.showIcon : true
        ),
        dataStep: new ConfigFormGroup({
          collection: new SelectFormControl(
            collection,
            marker('Collection'),
            marker('Resultlist collection description'),
            false,
            [],
            {
              optional: false,
              resetDependantsOnChange: true,
              isCollectionSelect: true
            },
            collectionService.getGroupCollectionItems()
          ),
          searchSize: new SliderFormControl(
            '',
            marker('Search size'),
            marker('Search size description'),
            50,
            500,
            10
          ),
          columns: (new FormArray([], {
            validators: Validators.required,
          })),
          details: new FormArray([]),
          detailsTitle: new HiddenFormControl(
            '',
            undefined,
            {
              optional: true
            }
          ),
          idFieldName: new HiddenFormControl(
            '',
            undefined,
            {
              dependsOn: () => [this.customControls.dataStep.collection],
              onDependencyChange: (control) => {
                this.setCollection(this.customControls.dataStep.collection.value);
                collectionService.getDescribe(this.collection).subscribe(d => {
                  control.setValue(d.params.id_path);
                });
              }
            }
          ),
          customComponent: new ComponentFormControl(
            ResultlistDataComponent,
            {
              control: () => this.customGroups.dataStep
            }
          )
        }).withTabName(marker('Data')),
        gridStep: new ConfigFormGroup({
          isDefaultMode: new SlideToggleFormControl(
            false,
            marker('List default mode'),
            marker('List default mode description')
          ),
          useHttpThumbnails: new SlideToggleFormControl(
            false,
            marker('Use http thumbnails'),
            marker('Use http thumbnails description')
          ),
          useHttpQuicklooks: new SlideToggleFormControl(
            false,
            marker('Use http quicklooks'),
            marker('Use http quicklooks description')
          ),
          tileLabelField: new SelectFormControl(
            '',
            marker('Tile label'),
            marker('Tile label description'),
            true,
            toOptionsObs(collectionService.getCollectionFields(collection, NUMERIC_OR_DATE_OR_TEXT_TYPES)),
            {
              optional: true,
              dependsOn: () => [this.customControls.dataStep.collection],
              onDependencyChange: (control: SelectFormControl) => {
                if (!this.collection || this.customControls.dataStep.collection.dirty) {
                  this.updateSelectFormControl(collectionService, control);
                }
              }
            }
          ),
          tileLabelFieldProcess: new TextareaFormControl(
            '',
            marker('Transformation title'),
            marker('Transformation title description'),
            '',
            1,
            {
              optional: true,
              validators:[TextareaFormControl.processValidator('result')],
              dependsOn: () => [this.customControls.dataStep.collection],
              onDependencyChange: (control: TextareaFormControl) => {
                if (!this.collection || this.customControls.dataStep.collection.dirty) {
                  control.setValue('');
                }
              }
            }
          ),
          tooltipField: new SelectFormControl(
            '',
            marker('Tooltip field'),
            marker('Tooltip field description'),
            true,
            toOptionsObs(collectionService.getCollectionFields(collection, NUMERIC_OR_DATE_OR_TEXT_TYPES)),
            {
              optional: true,
              dependsOn: () => [this.customControls.dataStep.collection],
              onDependencyChange: (control: SelectFormControl) => {
                if (!this.collection || this.customControls.dataStep.collection.dirty) {
                  this.updateSelectFormControl(collectionService, control);
                }
              }
            }
          ),
          tooltipFieldProcess: new TextareaFormControl(
            '',
            marker('Transformation tooltip'),
            marker('Transformation tooltip description'),
            '',
            1,
            {
              optional: true,
              validators:[TextareaFormControl.processValidator('result')],
              dependsOn: () => [this.customControls.dataStep.collection],
              onDependencyChange: (control: TextareaFormControl) => {
                if (!this.collection || this.customControls.dataStep.collection.dirty) {
                  control.setValue('');
                }
              }
            }
          ),
          colorIdentifier: new SelectFormControl(
            '',
            marker('Color identifier'),
            marker('Color identifier description'),
            true,
            toOptionsObs(collectionService.getCollectionFields(collection, TEXT_OR_KEYWORD)),
            {
              optional: true,
              dependsOn: () => [this.customControls.dataStep.collection],
              onDependencyChange: (control: SelectFormControl) => {
                if (!this.collection || this.customControls.dataStep.collection.dirty) {
                  this.updateSelectFormControl(collectionService, control);
                }
              }
            }
          ),
          thumbnailUrl: new FieldTemplateControl(
            '',
            marker('Thumbnail url'),
            marker('Thumbnail url description'),
            collectionService.getCollectionFields(collection),
            false,
            {
              optional: true,
              dependsOn: () => [this.customControls.dataStep.collection],
              onDependencyChange: (control: FieldTemplateControl) => {
                if (!this.collection || this.customControls.dataStep.collection.dirty) {
                  this.updateFieldTemplateControl(collectionService, control);
                }
              }
            }
          ),
          quicklookUrls: new FormArray([]),
          // DataStep is needed because the collection is needed
          quicklook: new ComponentFormControl(
            EditResultlistQuicklookComponent,
            {
              collectionControl: () => this.customControls.dataStep.collection,
              control: () => this.customControls.gridStep.quicklookUrls
            }
          )
        }).withTabName(marker('Resultlist grid')),
        sactionStep: new ConfigFormGroup({
          visualisationLink: new InputFormControl(
            '',
            marker('Visualisation url service title'),
            marker('Visualisation url service description'),
            'text',
            {
              optional: true,
              dependsOn: () => [this.customControls.dataStep.collection]
            }
          ),
          downloadLink: new InputFormControl(
            '',
            marker('Download url service title'),
            marker('Download url service description'),
            'text',
            {
              optional: true,
              dependsOn: () => [this.customControls.dataStep.collection]
            }
          )
        }).withTabName(marker('Actions')),
        settingsStep: new ConfigFormGroup({
          displayFilters: new SlideToggleFormControl(
            false,
            marker('Display filters'),
            marker('Display filters description')
          ),
          isGeoSortActived: new SlideToggleFormControl(
            false,
            marker('Activate geosort'),
            marker('Activate geosort')
          ),
          cellBackgroundStyle: new SelectFormControl(
            'filled',
            marker('Background style of cells'),
            marker('Background style of cells Description'),
            false,
            [
              { label: marker('Filled'), value: 'filled' },
              { label: marker('Outlined'), value: 'outlined' },
            ],
            {
              optional: true,
              dependsOn: () => [
                        this.customControls.dataStep.columns as any
              ],
              onDependencyChange: (control: ButtonFormControl) => {
                const useColorService = this.customControls.dataStep.columns.controls
                  .filter(c => c.get('useColorService').value === true).length > 0;
                control.enableIf(useColorService);
              }
            }
          ),
        }).withTabName(marker('Resultlist settings')),
        visualisationStep:new ConfigFormGroup({
          visualisationsList: new FormArray([]),
          visualisations:  new ComponentFormControl(
            EditResultlistVisualisationComponent,
            {
              collectionControl: () => this.customControls.dataStep.collection,
              control: () => this.customControls.visualisationStep.visualisationsList
            }
          ),
        }).withTabName('Visualisation'),
        unmanagedFields: new FormGroup({
          dataStep: new FormGroup({}),
          renderStep: new FormGroup({
            tableWidth: new FormControl(),
            globalActionsList: new FormControl(),
            nLastLines: new FormControl(),
            detailedGridHeight: new FormControl(),
            nbGridColumns: new FormControl(),
            isBodyHidden: new FormControl(),
            isAutoGeoSortActived: new FormControl(),
            selectedItemsEvent: new FormControl(),
            consultedItemEvent: new FormControl(),
            actionOnItemEvent: new FormControl(),
            globalActionEvent: new FormControl()
          }),
          sactionStep: new FormGroup({}),
        })
      });
  }

  public customGroups = {
    dataStep: this.get('dataStep') as ConfigFormGroup,
    gridStep: this.get('gridStep') as ConfigFormGroup,
    sactionStep: this.get('sactionStep') as ConfigFormGroup,
    settingsStep: this.get('settingsStep') as ConfigFormGroup,
    visualisationStep: this.get('visualisationStep') as ConfigFormGroup
  };

  public customControls = {
    title: this.get('title') as TitleInputFormControl,
    icon: this.get('icon') as HiddenFormControl,
    showName: this.get('showName') as HiddenFormControl,
    showIcon: this.get('showIcon') as HiddenFormControl,
    dataStep: {
      collection: this.get('dataStep.collection') as SelectFormControl,
      searchSize: this.get('dataStep.searchSize') as SliderFormControl,
      columns: this.get('dataStep.columns') as FormArray,
      detailsTitle: this.get('dataStep.detailsTitle') as HiddenFormControl,
      details: this.get('dataStep.details') as FormArray,
      idFieldName: this.get('dataStep.idFieldName') as HiddenFormControl,
    },
    gridStep: {
      isDefaultMode: this.get('gridStep.isDefaultMode') as SlideToggleFormControl,
      useHttpThumbnails: this.get('gridStep.useHttpThumbnails') as SlideToggleFormControl,
      useHttpQuicklooks: this.get('gridStep.useHttpQuicklooks') as SlideToggleFormControl,
      tileLabelField: this.get('gridStep.tileLabelField') as SelectFormControl,
      tileLabelFieldProcess: this.get('gridStep.tileLabelFieldProcess') as TextareaFormControl,
      tooltipField: this.get('gridStep.tooltipField') as SelectFormControl,
      tooltipFieldProcess: this.get('gridStep.tooltipFieldProcess') as TextareaFormControl,
      thumbnailUrl: this.get('gridStep.thumbnailUrl') as FieldTemplateControl,
      colorIdentifier: this.get('gridStep.colorIdentifier') as SelectFormControl,
      quicklookUrls: this.get('gridStep.quicklookUrls') as FormArray
    },
    sactionStep: {
      visualisationLink: this.get('sactionStep.visualisationLink') as InputFormControl,
      downloadLink: this.get('sactionStep.downloadLink') as InputFormControl,
    },
    settingsStep:  {
      displayFilters: this.get('settingsStep.displayFilters') as SlideToggleFormControl,
      isGeoSortActived: this.get('settingsStep.isGeoSortActived') as SlideToggleFormControl,
      cellBackgroundStyle: this.get('settingsStep.cellBackgroundStyle') as SelectFormControl
    },
    visualisationStep: {
      visualisationLink: this.get('visualisationStep.visualisationLink') as InputFormControl,
      visualisationsList: this.get('visualisationStep.visualisationsList') as FormArray
    },
    unmanagedFields: {
      dataStep: {},
      renderStep: {
        tableWidth: this.get('unmanagedFields.renderStep.tableWidth'),
        globalActionsList: this.get('unmanagedFields.renderStep.globalActionsList'),
        nLastLines: this.get('unmanagedFields.renderStep.nLastLines'),
        detailedGridHeight: this.get('unmanagedFields.renderStep.detailedGridHeight'),
        nbGridColumns: this.get('unmanagedFields.renderStep.nbGridColumns'),
        isBodyHidden: this.get('unmanagedFields.renderStep.isBodyHidden'),
        isAutoGeoSortActived: this.get('unmanagedFields.renderStep.isAutoGeoSortActived'),
        selectedItemsEvent: this.get('unmanagedFields.renderStep.selectedItemsEvent'),
        consultedItemEvent: this.get('unmanagedFields.renderStep.consultedItemEvent'),
        actionOnItemEvent: this.get('unmanagedFields.renderStep.actionOnItemEvent'),
        globalActionEvent: this.get('unmanagedFields.renderStep.globalActionEvent')
      },
      sactionStep: {}
    }
  };

  private updateFieldTemplateControl(collectionService: CollectionService, control: FieldTemplateControl) {
    this.setCollection(this.customControls.dataStep.collection.value);
    toNumericOrDateOrKeywordOrTextObs(collectionService
      .getCollectionFields(this.customControls.dataStep.collection.value))
      .subscribe(collectionFs => {
        control.setValue('');
        control.fields = collectionFs;
        control.filterAutocomplete();
      });
  }

  private updateSelectFormControl(collectionService: CollectionService, control: SelectFormControl): void {
    this.setCollection(this.customControls.dataStep.collection.value);
    toOptionsObs(collectionService
      .getCollectionFields(this.customControls.dataStep.collection.value))
      .subscribe(collectionFs => {
        control.setSyncOptions(collectionFs);
        control.setValue('');
      });
  }
}

export class ResultlistColumnFormGroup extends CollectionConfigFormGroup {

  public constructor(
    fieldsObs: Observable<Array<SelectOption>>,
    collection: string,
    private globalKeysToColortrl: FormArray,
    defaultConfig: DefaultConfig,
    dialog: MatDialog,
    collectionService: CollectionService,
    private colorService: ArlasColorService
  ) {
    super(collection,
      {
        columnName: new InputFormControl(
          '',
          marker('Column name'),
          ''
        ),
        fieldName: new SelectFormControl(
          '',
          marker('Column field'),
          '',
          true,
          fieldsObs
        ),
        dataType: new InputFormControl(
          '',
          marker('Unit of the column'),
          '',
          undefined,
          {
            optional: true
          }
        ),
        process: new TextareaFormControl(
          '',
          marker('Transformation'),
          '',
          '',
          1,
          {
            optional: true,
            validators:[TextareaFormControl.processValidator('result')],
          }
        ),
        useColorService: new SlideToggleFormControl(
          false,
          marker('Colorize'),
          '',
          {
            optional: true

          }
        ),
        sort: new HiddenFormControl(
          '',
          '',
          {
            optional: true

          }
        ),
        keysToColorsButton: new ButtonFormControl(
          '',
          marker('Manage colors'),
          '',
          () => collectionService.getTermAggregation(this.collection, this.customControls.fieldName.value)
            .then((keywords: Array<string>) => {
              globalKeysToColortrl.clear();
              keywords.forEach((k: string, index: number) => {
                this.addToColorManualValuesCtrl({
                  keyword: k.toString(),
                  color: this.colorService.getColor(k)
                }, index);
              });
              this.addToColorManualValuesCtrl({
                keyword: 'OTHER',
                color: defaultConfig.otherColor
              });

              const sub = dialog.open(DialogColorTableComponent, {
                data: {
                  collection: this.collection,
                  sourceField: this.customControls.fieldName.value,
                  keywordColors: globalKeysToColortrl.value
                } as DialogColorTableData,
                autoFocus: false,
              })
                .afterClosed().subscribe((result: Array<KeywordColor>) => {
                  if (result !== undefined) {
                    result.forEach((kc: KeywordColor) => {
                      /** after closing the dialog, save the [keyword, color] list in the ARLAS color service */
                      (colorService.colorGenerator as ArlasColorGeneratorLoader).updateKeywordColor(kc.keyword, kc.color);
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
              this.customControls.useColorService,
              this.customControls.fieldName,
            ],
            onDependencyChange: (control: ButtonFormControl) => {
              control.enableIf(this.customControls.useColorService.value);
              control.disabledButton = !this.customControls.fieldName.value;
            }
          }),
      });
  }

  public customControls = {
    columnName: this.get('columnName') as InputFormControl,
    fieldName: this.get('fieldName') as SelectFormControl,
    dataType: this.get('dataType') as InputFormControl,
    process: this.get('process') as TextareaFormControl,
    useColorService: this.get('useColorService') as SlideToggleFormControl,
    sort: this.get('sort') as HiddenFormControl
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

export class ResultlistDetailFormGroup extends FormGroup {

  public constructor() {
    super({
      name: new InputFormControl(
        '',
        marker('Section'),
        ''
      ),
      fields: new FormArray([], Validators.required)
    });
  }

  public customControls = {
    name: this.get('name') as InputFormControl,
    fields: this.get('fields') as FormArray,
  };
}

export class ResultlistDetailFieldFormGroup extends FormGroup {

  public constructor(fieldsObs: Observable<Array<SelectOption>>) {
    super({
      label: new InputFormControl(
        '',
        marker('Detail label'),
        ''
      ),
      path: new SelectFormControl(
        '',
        marker('Detail field'),
        '',
        true,
        fieldsObs
      ),
      process: new TextareaFormControl(
        '',
        marker('Apply a calculation in javascript'),
        '',
        marker('e.g : result+\'$\''),
        1,
        {
          optional: true,
          validators:[TextareaFormControl.processValidator('result')],
        }
      )
    });
  }

  public customControls = {
    label: this.get('label') as InputFormControl,
    path: this.get('path') as SelectFormControl,
    process: this.get('process') as TextareaFormControl,
  };
}


export class ResultlistQuicklookFormGroup extends FormGroup {

  /** TODO:
   * Put filter fields as optional
   * Put filterValues only if filterField is set
   */
  public constructor(fieldsObs: Observable<Array<CollectionField>>, collection: string, collectionService: CollectionService) {
    super({
      url: new FieldTemplateControl(
        '',
        marker('Quicklook url'),
        marker('Quicklook url description'),
        fieldsObs,
        true
      ),
      description: new FieldTemplateControl(
        '',
        marker('Quicklook description'),
        marker('Quicklook description description'),
        fieldsObs,
        true,
        {
          optional: true
        }
      ),
      filter: new ConfigFormGroup({
        field: new SelectFormControl(
          '',
          marker('Quicklook filter field'),
          marker('Quicklook filter field description'),
          true,
          toOptionsObs(fieldsObs),
          {
            optional: true
          }
        ),
        values: new MultipleSelectFormControl(
          // Mark as invalid if there is a value on filterField and not there
          '',
          marker('Quicklook filter values'),
          marker('Quicklook filter values description'),
          false,
          [],
          {
            optional: true,
            dependsOn: () => [this.customControls.filter.field],
            onDependencyChange: (control: MultipleSelectFormControl) => {
              if (!this.customControls.filter.field.touched) {
                // Avoid to reset the imported configuration when first loading it
              } else if (this.customControls.filter.field.value !== '' && !!this.customControls.filter.field.syncOptions
                && this.customControls.filter.field.syncOptions.map(f => f.value).includes(this.customControls.filter.field.value)) {
                control.setSyncOptions([]);
                collectionService.getTermAggregation(
                  collection,
                  this.customControls.filter.field.value)
                  .then(keywords => {
                    control.setSyncOptions(keywords.map(k => ({ value: k, label: k })));
                  });
              } else {
                control.setSyncOptions([]);
              }
              control.markAsUntouched();
            }
          },
          false
        )
      })
    });
  }

  public customControls = {
    url: this.get('url') as FieldTemplateControl,
    description: this.get('description') as FieldTemplateControl,
    filter: {
      field: this.get('filter.field') as SelectFormControl,
      values: this.get('filter.values') as MultipleSelectFormControl
    }
  };
}


export class ResultListVisualisationsFormGroup extends FormGroup {
  public constructor(fieldsObs?: Observable<Array<CollectionField>>, collection?: string, collectionService?: CollectionService) {
    super({
      name: new InputFormControl(
        '',
        marker('Name'),
        marker('Name'),
      ),
      description: new InputFormControl(
        '',
        marker('Description'),
        marker('Description'),
      ),
      dataGroups: new FormArray<ResultListVisualisationsDataGroup>([])
    });
  }

  public customControls = {
    name: this.get('name') as InputFormControl,
    description: this.get('description') as TextareaFormControl,
    dataGroups: this.get('dataGroups') as FormArray<ResultListVisualisationsDataGroup>
  };
}

export class ResultListVisualisationsDataGroup extends FormGroup {
  public constructor() {
    super({
      name: new InputFormControl(
        '',
        marker('Data groups name'),
        ''
      ),
      filters: new FormArray<ResultListVisualisationsDataGroupFilter>([]),
      protocol: new SelectFormControl(
        '',
        marker('Protocol'),
        marker('Protocol'),
        false,
        [
          { label: marker('Titiler'), value: 'titiler' },
          { label: marker('Other'), value: 'other' },
        ],
      ),
      visualisationUrl: new InputFormControl(
        '',
        marker('View URL'),
        '',
        'text',
        {
          validators: [Validators.pattern('^(http|https)\:\/\/.*')]
        }
      ),
    });
  }

  public customControls = {
    name: this.get('name') as InputFormControl,
    protocol: this.get('protocol') as SelectFormControl,
    filters:  this.get('filters') as FormArray<ResultListVisualisationsDataGroupFilter>,
    visualisationUrl: this.get('visualisationUrl') as InputFormControl
  };
}


export class ResultListVisualisationsDataGroupFilter extends FormGroup {
  public editing = false;
  public editionInfo: { field: string; op: FILTER_OPERATION; };
  public constructor(
    collectionFields: Observable<Array<CollectionField>>,
    filterOperations: Array<FILTER_OPERATION>,
    collectionService: CollectionService,
    collection: string) {
    super({
      filterField: new TypedSelectFormControl(
        '',
        marker('Condition fields'),
        marker('Condition fields'),
        true,
        toNumericOrDateOrKeywordOrBooleanObs(collectionFields),
        {
          optional: false
        }
      ),
      filterOperation: new SelectFormControl(
        '',
        marker('operation'),
        marker('filter operation description'),
        false,
        valuesToOptions(filterOperations),
        {
          resetDependantsOnChange: true,
          dependsOn: () => [this.customControls.filterField],
          onDependencyChange: (control: SelectFormControl) => {
            if (!this.editing) {
              /** update list of available ops according to field type */
              if (this.customControls.filterField.value.type === 'KEYWORD') {
                control.setSyncOptions([
                  { value: FILTER_OPERATION.IN, label: FILTER_OPERATION.IN },
                  { value: FILTER_OPERATION.NOT_IN, label: FILTER_OPERATION.NOT_IN }
                ]);
              } else if (this.customControls.filterField.value.type === 'BOOLEAN') {
                control.setSyncOptions([
                  { value: FILTER_OPERATION.IS, label: FILTER_OPERATION.IS }
                ]);
              } else {
                control.setSyncOptions([
                  { value: FILTER_OPERATION.EQUAL, label: FILTER_OPERATION.EQUAL },
                  { value: FILTER_OPERATION.NOT_EQUAL, label: FILTER_OPERATION.NOT_EQUAL },
                  { value: FILTER_OPERATION.RANGE, label: FILTER_OPERATION.RANGE },
                  { value: FILTER_OPERATION.OUT_RANGE, label: FILTER_OPERATION.OUT_RANGE },
                ]);
              }
              control.setValue(control.syncOptions[0].value);
            } else {
              // if we are editing an existing filter, keep the selected operation.
              // otherwise there is no way to remember it
              if ((this.customControls.filterOperation.value === FILTER_OPERATION.IN ||
                      this.customControls.filterOperation.value === FILTER_OPERATION.NOT_IN)) {
                control.setSyncOptions([
                  { value: FILTER_OPERATION.IN, label: FILTER_OPERATION.IN },
                  { value: FILTER_OPERATION.NOT_IN, label: FILTER_OPERATION.NOT_IN }
                ]);
              } else if (this.customControls.filterOperation.value === FILTER_OPERATION.IS) {
                control.setSyncOptions([
                  { value: FILTER_OPERATION.IS, label: FILTER_OPERATION.IS }
                ]);
              } else {
                control.setSyncOptions([
                  { value: FILTER_OPERATION.EQUAL, label: FILTER_OPERATION.EQUAL },
                  { value: FILTER_OPERATION.NOT_EQUAL, label: FILTER_OPERATION.NOT_EQUAL },
                  { value: FILTER_OPERATION.RANGE, label: FILTER_OPERATION.RANGE },
                  { value: FILTER_OPERATION.OUT_RANGE, label: FILTER_OPERATION.OUT_RANGE },
                ]);
              }
              control.setValue(this.customControls.filterOperation.value);
            }
          }
        }
      ),
      filterValues: new ConfigFormGroup({
        operator: new HiddenFormControl(
          '',
          null,
          {
            optional: true,
            resetDependantsOnChange: true,
            dependsOn: () => [this.customControls.filterOperation],
            onDependencyChange: (control: InputFormControl) => {
              control.setValue(this.customControls.filterOperation.value);
            }
          }
        ),
        filterInValues: new MultipleSelectFormControl(
          '',
          marker('values'),
          marker('filter in-values description'),
          false,
          [],
          {
            resetDependantsOnChange: true,
            dependsOn: () => [this.customControls.filterField],
            onDependencyChange: (control: MultipleSelectFormControl) => {
              console.log(this.customControls.filterOperation.value);
              if (!!this.customControls.filterField.value && !!this.customControls.filterField.value.value ) {
                if (this.customControls.filterOperation.value === FILTER_OPERATION.IN ||
                                this.customControls.filterOperation.value === FILTER_OPERATION.NOT_IN) {
                  control.setSyncOptions([]);
                  collectionService.getTermAggregation(
                    collection,
                    this.customControls.filterField.value.value)
                    .then(keywords => {
                      control.setSyncOptions(keywords.map(k => ({ value: k, label: k })));
                    });
                } else {
                  control.setSyncOptions([]);
                }
              } else {
                control.setSyncOptions([]);
              }
              // if we are editing an existing filter, keep the selected items.
              // otherwise there is no way to remember them
              if (!this.editing) {
                control.savedItems = new Set();
                control.selectedMultipleItems = [];
              }
              control.enableIf(this.customControls.filterOperation.value === FILTER_OPERATION.IN ||
                            this.customControls.filterOperation.value === FILTER_OPERATION.NOT_IN);
            }
          }
        ),
        filterEqualValues: new InputFormControl(
          '',
          marker('values'),
          marker('filter equal description'),
          'number',
          {
            resetDependantsOnChange: true,
            dependsOn: () => [this.customControls.filterOperation, this.customControls.filterField],
            onDependencyChange: (control: InputFormControl) => {
              control.enableIf(this.customControls.filterOperation.value === FILTER_OPERATION.EQUAL ||
                            this.customControls.filterOperation.value === FILTER_OPERATION.NOT_EQUAL);
            }
          }
        ),
        filterMinRangeValues: new InputFormControl(
          '',
          marker('Minimum range filter'),
          marker('Minimum range filter description'),
          'number',
          {
            resetDependantsOnChange: true,
            dependsOn: () => [
              this.customControls.filterOperation, this.customControls.filterField
            ],
            onDependencyChange: (control, isLoading) => {
              const doRangeEnable = this.customControls.filterOperation.value === FILTER_OPERATION.RANGE ||
                            this.customControls.filterOperation.value === FILTER_OPERATION.OUT_RANGE;
              control.enableIf(doRangeEnable);
              if (doRangeEnable && !isLoading) {
                collectionService.getComputationMetric(
                  collection,
                  this.customControls.filterField.value.value,
                  METRIC_TYPES.MIN)
                  .then(min =>
                    control.setValue(min));
              }
            }
          },
          () => this.customControls.filterValues.filterMaxRangeValues,
          undefined
        ),
        filterMaxRangeValues: new InputFormControl(
          '',
          marker('Maximum range filter'),
          marker('Maximum range filter description'),
          'number',
          {
            resetDependantsOnChange: true,
            dependsOn: () => [
              this.customControls.filterOperation, this.customControls.filterField
            ],
            onDependencyChange: (control, isLoading) => {
              const doRangeEnable = this.customControls.filterOperation.value === FILTER_OPERATION.RANGE ||
                            this.customControls.filterOperation.value === FILTER_OPERATION.OUT_RANGE;
              control.enableIf(doRangeEnable);
              if (doRangeEnable && !isLoading) {
                collectionService.getComputationMetric(
                  collection,
                  this.customControls.filterField.value.value,
                  METRIC_TYPES.MAX)
                  .then(max =>
                    control.setValue(max));
              }
            }
          },
          undefined,
          () => this.customControls.filterValues.filterMinRangeValues
        ),
        filterBoolean: new ButtonToggleFormControl(
          true,
          [
            {
              label: marker('activated'), value: true
            },
            {
              label: marker('not activated'), value: false
            }
          ],
          undefined,
          {
            resetDependantsOnChange: true,
            dependsOn: () => [this.customControls.filterField],
            onDependencyChange: (control: ButtonToggleFormControl) => {
              control.enableIf(this.customControls.filterOperation.value === FILTER_OPERATION.IS);
            }
          })
      }),
      id: new HiddenFormControl(
        '',
        null,
        {
          optional: true
        }
      ),
    });
  }

  public customControls = {
    filterField: this.get('filterField') as TypedSelectFormControl,
    filterOperation: this.get('filterOperation') as SelectFormControl,
    filterValues: {
      filterInValues: this.get('filterValues.filterInValues') as MultipleSelectFormControl,
      filterEqualValues: this.get('filterValues.filterEqualValues') as InputFormControl,
      filterMinRangeValues: this.get('filterValues.filterMinRangeValues') as InputFormControl,
      filterMaxRangeValues: this.get('filterValues.filterMaxRangeValues') as InputFormControl,
      filterBoolean: this.get('filterValues.filterBoolean') as ButtonToggleFormControl,
    },
    id: this.get('id') as HiddenFormControl
  };
}




@Injectable({
  providedIn: 'root'
})
export class ResultlistFormBuilderService extends WidgetFormBuilder {

  public defaultKey = 'analytics.widgets.resultlist';

  public constructor(
    protected collectionService: CollectionService,
    protected mainFormService: MainFormService,
    private defaultValuesService: DefaultValuesService,
    private dialog: MatDialog,
    private colorService: ArlasColorService,
    private router: Router,
  ) {
    super(collectionService, mainFormService);
  }

  public build(collection: string) {
    const formGroup = new ResultlistConfigForm(collection, this.collectionService);
    this.defaultValuesService.setDefaultValueRecursively(this.defaultKey, formGroup);
    return formGroup;
  }

  public buildWithValues(value: any, collection: string) {
    const formGroup = this.build(collection);
    // for each column, the related FormGroup must be created before setting its values
    const columns = (value.dataStep || {}).columns || [];
    columns.forEach(c => formGroup.customControls.dataStep.columns
      .push(this.buildColumn(collection)));

    // same for the details, and the fields within
    const details = (value.dataStep || {}).details || [];
    details.forEach(d => {
      const detail = this.buildDetail();
      d.fields.forEach(f => detail.customControls.fields.push(this.buildDetailField(collection)));
      formGroup.customControls.dataStep.details.push(detail);
    });

    formGroup.patchValue(value);
    return formGroup;
  }

  // TODO Optimize by not requesting the collection fields (also for other build methods)
  public buildColumn(collection: string) {
    const fieldObs = toOptionsObs(this.collectionService.getCollectionFields(collection, NUMERIC_OR_DATE_OR_KEYWORD));
    return new ResultlistColumnFormGroup(
      fieldObs,
      collection,
      this.mainFormService.commonConfig.getKeysToColorFa(),
      this.defaultValuesService.getDefaultConfig(),
      this.dialog,
      this.collectionService,
      this.colorService
    );
  }

  public buildDetail() {
    return new ResultlistDetailFormGroup();
  }

  public buildDetailField(collection: string) {
    return new ResultlistDetailFieldFormGroup(
      toOptionsObs(
        this.collectionService.getCollectionFields(collection, NUMERIC_OR_DATE_OR_TEXT_TYPES))
    );
  }

  public buildQuicklook(collection: string) {
    const fieldObs = this.collectionService.getCollectionFields(collection, TEXT_OR_KEYWORD);
    const control = new ResultlistQuicklookFormGroup(
      fieldObs,
      collection,
      this.collectionService);
    ConfigFormGroupComponent.listenToAllControlsOnDependencyChange(control.get('filter') as ConfigFormGroup, []);
    return control;
  }

  public buildVisualisation() {
    return new ResultListVisualisationsFormGroup();
  }

  public buildVisualisationsDataGroup() {
    return  new ResultListVisualisationsDataGroup();
  }

  public buildVisualisationsDataGroupFilter(collection: string) {
    const collectionFields = this.collectionService.getCollectionFields(collection);
    const operators = [FILTER_OPERATION.IN, FILTER_OPERATION.RANGE, FILTER_OPERATION.EQUAL, FILTER_OPERATION.NOT_IN,
      FILTER_OPERATION.IS, FILTER_OPERATION.OUT_RANGE, FILTER_OPERATION.NOT_EQUAL];

    const control = new ResultListVisualisationsDataGroupFilter(collectionFields,
      operators, this.collectionService, collection    );
    ConfigFormGroupComponent.listenToOnDependencysChange(control.get('filterField') as ConfigFormControl, []);
    ConfigFormGroupComponent.listenToOnDependencysChange(control.get('filterOperation') as ConfigFormControl, []);
    ConfigFormGroupComponent.listenToAllControlsOnDependencyChange(control.get('filterValues') as ConfigFormGroup, []);
    return control;
  }

}
