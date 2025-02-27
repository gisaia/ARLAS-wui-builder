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
import { ResultlistDataComponent } from '@analytics-config/components/resultlist-data/resultlist-data.component';
import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { marker } from '@colsen1991/ngx-translate-extract-marker';
import { DialogColorTableComponent } from '@map-config/components/dialog-color-table/dialog-color-table.component';
import { DialogColorTableData, KeywordColor } from '@map-config/components/dialog-color-table/models';
import { CollectionService } from '@services/collection-service/collection.service';
import {
  NUMERIC_OR_DATE_OR_KEYWORD,
  NUMERIC_OR_DATE_OR_TEXT_TYPES, TEXT_OR_KEYWORD,
  toNumericOrDateOrKeywordOrTextObs, toOptionsObs
} from '@services/collection-service/tools';
import { DefaultConfig, DefaultValuesService } from '@services/default-values/default-values.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { CollectionConfigFormGroup } from '@shared-models/collection-config-form';
import {
  ButtonFormControl, ComponentFormControl, ConfigFormGroup, HiddenFormControl, InputFormControl,
  MultipleSelectFormControl,
  SelectFormControl, SelectOption, SliderFormControl, SlideToggleFormControl, TextareaFormControl,
  TitleInputFormControl, FieldTemplateControl
} from '@shared-models/config-form';
import { Observable } from 'rxjs';
import { WidgetFormBuilder } from '../widget-form-builder';
import { ArlasColorService } from 'arlas-web-components';
import { WidgetConfigFormGroup } from '@shared-models/widget-config-form';
import { CollectionField } from '@services/collection-service/models';
import { EditResultlistQuicklookComponent } from '@analytics-config/components/edit-resultlist-quicklook/edit-resultlist-quicklook.component';
import { Router } from '@angular/router';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { CollectionReferenceDescriptionProperty } from 'arlas-api';
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
        renderStep: new ConfigFormGroup({
          displayFilters: new SlideToggleFormControl(
            '',
            marker('Display filters'),
            marker('Display filters description')
          ),
          isGeoSortActived: new SlideToggleFormControl(
            '',
            marker('Activate geosort'),
            marker('Activate geosort')
          ),
          cellBackgroundStyle: new SelectFormControl(
            '',
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
                control: () => this.customControls.renderStep.gridStep.quicklookUrls
              }
            )
          }).withTitle(marker('Grid view'))
        }).withTabName(marker('Render')),
        zactionStep: new ConfigFormGroup({
          visualisationLink: new InputFormControl(
            '',
            marker('Visualisation url service title'),
            marker('Visualisation url service description'),
            'text',
            {
              optional: true,
              width: '100%',
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
              width: '100%',
              dependsOn: () => [this.customControls.dataStep.collection]
            }
          ),
          visualisationSection:new ConfigFormGroup({
            visualisationsList: new FormArray([]),
            visualisations:  new ComponentFormControl(
              EditResultlistVisualisationComponent,
              {
                collectionControl: () => this.customControls.dataStep.collection,
                control: () => this.customControls.zactionStep.visualisationSection.visualisationsList
              }
            )
          }).withTitle(marker('Add a visualization configuration'))
        }).withTabName(marker('Actions')),
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
          zactionStep: new FormGroup({}),
        })
      });
  }

  public customGroups = {
    dataStep: this.get('dataStep') as ConfigFormGroup,
    renderStep: this.get('renderStep') as ConfigFormGroup,
    zactionStep: this.get('zactionStep') as ConfigFormGroup
  };

  public customControls = {
    title: this.get('title') as TitleInputFormControl,
    icon: this.get('icon') as HiddenFormControl,
    showName: this.get('showName') as HiddenFormControl,
    showIcon: this.get('showIcon') as HiddenFormControl,
    dataStep: {
      collection: this.get('dataStep.collection') as SelectFormControl,
      searchSize: this.get('dataStep.searchSize') as SliderFormControl,
      visualisationLink: this.get('dataStep.visualisationLink') as InputFormControl,
      downloadLink: this.get('dataStep.downloadLink') as InputFormControl,
      columns: this.get('dataStep.columns') as FormArray,
      detailsTitle: this.get('dataStep.detailsTitle') as HiddenFormControl,
      details: this.get('dataStep.details') as FormArray,
      idFieldName: this.get('dataStep.idFieldName') as HiddenFormControl,
    },
    renderStep: {
      displayFilters: this.get('renderStep.displayFilters') as SlideToggleFormControl,
      isGeoSortActived: this.get('renderStep.isGeoSortActived') as SlideToggleFormControl,
      cellBackgroundStyle: this.get('renderStep.cellBackgroundStyle') as SelectFormControl,
      gridStep: {
        isDefaultMode: this.get('renderStep.gridStep.isDefaultMode') as SlideToggleFormControl,
        useHttpThumbnails: this.get('renderStep.gridStep.useHttpThumbnails') as SlideToggleFormControl,
        useHttpQuicklooks: this.get('renderStep.gridStep.useHttpQuicklooks') as SlideToggleFormControl,
        tileLabelField: this.get('renderStep.gridStep.tileLabelField') as SelectFormControl,
        tileLabelFieldProcess: this.get('renderStep.gridStep.tileLabelFieldProcess') as TextareaFormControl,
        tooltipField: this.get('renderStep.gridStep.tooltipField') as SelectFormControl,
        tooltipFieldProcess: this.get('renderStep.gridStep.tooltipFieldProcess') as TextareaFormControl,
        thumbnailUrl: this.get('renderStep.gridStep.thumbnailUrl') as FieldTemplateControl,
        colorIdentifier: this.get('renderStep.gridStep.colorIdentifier') as SelectFormControl,
        quicklookUrls: this.get('renderStep.gridStep.quicklookUrls') as FormArray
      }
    },
    zactionStep: {
      visualisationLink: this.get('zactionStep.visualisationLink') as InputFormControl,
      downloadLink: this.get('zactionStep.downloadLink') as InputFormControl,
      visualisationSection: {
        visualisationsList: this.get('zactionStep.visualisationSection.visualisationsList') as FormArray
      }
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
      zactionStep: {}

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
          '',
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
      itemsFamilies: new FormArray<ResultListVisualisationsItemFamily>([])
    });
  }

  public customControls = {
    name: this.get('name') as InputFormControl,
    description: this.get('description') as TextareaFormControl,
    itemsFamilies: this.get('itemsFamilies') as FormArray<ResultListVisualisationsItemFamily>
  };
}

export class ResultListVisualisationsItemFamily extends FormGroup {
  public constructor(fieldsObs?: Observable<Array<CollectionField>>, collection?: string, collectionService?: CollectionService) {
    super({
      itemsFamily: new InputFormControl(
        '',
        marker('Item family name'),
        ''
      ),
      filter: new ConfigFormGroup({
        field: new SelectFormControl(
          '',
          marker('Condition fields'),
          marker('Condition fields'),
          true,
          toOptionsObs(fieldsObs),
          {
            optional: true
          }
        ),
        values: new MultipleSelectFormControl(
          // Mark as invalid if there is a value on filterField and not there
          '',
          marker('Condition values'),
          marker('Condition values description'),
          false,
          [],
          {
            optional: true,
            dependsOn: () => [this.customControls.filter.field],
            onDependencyChange: (control: MultipleSelectFormControl) => {
              if (!this.customControls.filter.field.touched && this.customControls.filter.field.value !== '') {
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
                control.selectedMultipleItems = [];
                control.patchValue([]);
                control.savedItems = new Set<string>();
              }
              control.markAsUntouched();
            }
          },
          false
        )
      }),
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
    itemsFamily: this.get('itemsFamily') as InputFormControl,
    protocol: this.get('protocol') as SelectFormControl,
    filter: {
      field: this.get('filter.field') as SelectFormControl,
      values: this.get('filter.values') as MultipleSelectFormControl
    },
    visualisationUrl: this.get('visualisationUrl') as InputFormControl
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

  public buildVisualisationsItemFamily(collection: string) {
    const fieldObs = this.collectionService.getCollectionFields(collection, TEXT_OR_KEYWORD);
    const control = new ResultListVisualisationsItemFamily(fieldObs,
      collection,
      this.collectionService);
    ConfigFormGroupComponent.listenToAllControlsOnDependencyChange(control.get('filter') as ConfigFormGroup, []);
    return control;
  }

}
