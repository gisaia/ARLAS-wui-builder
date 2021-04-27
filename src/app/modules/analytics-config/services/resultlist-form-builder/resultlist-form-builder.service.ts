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
import { WidgetFormBuilder } from '../widget-form-builder';
import { MainFormService } from '@services/main-form/main-form.service';
import { CollectionService } from '@services/collection-service/collection.service';
import {
  ConfigFormGroup, InputFormControl, SliderFormControl, SlideToggleFormControl, SelectFormControl, TextareaFormControl, SelectOption,
  HiddenFormControl,
  ComponentFormControl,
  TitleInputFormControl,
  ButtonFormControl
} from '@shared-models/config-form';
import { FormArray, Validators, FormGroup, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { toOptionsObs, NUMERIC_OR_DATE_OR_TEXT_TYPES } from '@services/collection-service/tools';
import { CollectionReferenceDescription } from 'arlas-api';
import { ResultlistDataComponent } from '@analytics-config/components/resultlist-data/resultlist-data.component';
import { DefaultConfig, DefaultValuesService } from '@services/default-values/default-values.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { MatDialog } from '@angular/material/dialog';
import { DialogColorTableComponent } from '@map-config/components/dialog-color-table/dialog-color-table.component';
import { DialogColorTableData, KeywordColor } from '@map-config/components/dialog-color-table/models';

export class ResultlistConfigForm extends ConfigFormGroup {

  constructor(
    describe: Observable<CollectionReferenceDescription>,
  ) {
    super({
      title: new InputFormControl(
        '',
        marker('resultlist title'),
        marker('resultlist title description'),
        undefined,
        {
          childs: () => [this.customControls.dataStep.idFieldName]
        }
      ),
      dataStep: new ConfigFormGroup({
        searchSize: new SliderFormControl(
          '',
          marker('Search size'),
          marker('Search size description'),
          10,
          500,
          10
        ),
        columns: new FormArray([], Validators.required),
        details: new FormArray([]),
        idFieldName: new HiddenFormControl(
          '',
          undefined,
          {
            onDependencyChange: (control) => {
              const sub = describe.subscribe(d => {
                control.setValue(d.params.id_path);
                sub.unsubscribe();
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
        )
      }).withTabName(marker('Render')),
      unmanagedFields: new FormGroup({
        dataStep: new FormGroup({}),
        renderStep: new FormGroup({
          tableWidth: new FormControl(),
          globalActionsList: new FormControl(),
          nLastLines: new FormControl(),
          detailedGridHeight: new FormControl(),
          nbGridColumns: new FormControl(),
          defautMode: new FormControl(),
          isBodyHidden: new FormControl(),
          isGeoSortActived: new FormControl(),
          isAutoGeoSortActived: new FormControl(),
          selectedItemsEvent: new FormControl(),
          consultedItemEvent: new FormControl(),
          actionOnItemEvent: new FormControl(),
          globalActionEvent: new FormControl(),
        }),
      })
    });
  }

  public customGroups = {
    dataStep: this.get('dataStep') as ConfigFormGroup,
    renderStep: this.get('renderStep') as ConfigFormGroup,
  };

  public customControls = {
    title: this.get('title') as TitleInputFormControl,
    dataStep: {
      searchSize: this.get('dataStep.searchSize') as SliderFormControl,
      columns: this.get('dataStep.columns') as FormArray,
      details: this.get('dataStep.details') as FormArray,
      idFieldName: this.get('dataStep.idFieldName') as HiddenFormControl,
    },
    renderStep: {
      displayFilters: this.get('renderStep.displayFilters') as SlideToggleFormControl,
      cellBackgroundStyle: this.get('renderStep.cellBackgroundStyle') as SelectFormControl,
    },
    unmanagedFields: {
      dataStep: {},
      renderStep: {
        tableWidth: this.get('unmanagedFields.renderStep.tableWidth'),
        globalActionsList: this.get('unmanagedFields.renderStep.globalActionsList'),
        nLastLines: this.get('unmanagedFields.renderStep.nLastLines'),
        detailedGridHeight: this.get('unmanagedFields.renderStep.detailedGridHeight'),
        nbGridColumns: this.get('unmanagedFields.renderStep.nbGridColumns'),
        defautMode: this.get('unmanagedFields.renderStep.defautMode'),
        isBodyHidden: this.get('unmanagedFields.renderStep.isBodyHidden'),
        isGeoSortActived: this.get('unmanagedFields.renderStep.isGeoSortActived'),
        isAutoGeoSortActived: this.get('unmanagedFields.renderStep.isAutoGeoSortActived'),
        selectedItemsEvent: this.get('unmanagedFields.renderStep.selectedItemsEvent'),
        consultedItemEvent: this.get('unmanagedFields.renderStep.consultedItemEvent'),
        actionOnItemEvent: this.get('unmanagedFields.renderStep.actionOnItemEvent'),
        globalActionEvent: this.get('unmanagedFields.renderStep.globalActionEvent'),
      }
    }
  };
}

export class ResultlistColumnFormGroup extends ConfigFormGroup {

  constructor(fieldsObs: Observable<Array<SelectOption>>,
              collection: string,
              private globalKeysToColortrl: FormArray,
              defaultConfig: DefaultConfig,
              dialog: MatDialog,
              collectionService: CollectionService,
              private colorService: ArlasColorGeneratorLoader) {
    super({
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
        1,
        {
          optional: true
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
      keysToColorsButton: new ButtonFormControl(
        '',
        marker('Manage colors'),
        '',
        () => collectionService.getTermAggregation(collection, this.customControls.fieldName.value)
          .then((keywords: Array<string>) => {
            globalKeysToColortrl.clear();
            keywords.forEach((k: string, index: number) => {
              this.addToColorManualValuesCtrl({
                keyword: k.toString(),
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
                sourceField: this.customControls.fieldName.value,
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

  constructor() {
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

  constructor(fieldsObs: Observable<Array<SelectOption>>) {
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
        marker('Transformation'),
        '',
        1,
        {
          optional: true
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

@Injectable({
  providedIn: 'root'
})
export class ResultlistFormBuilderService extends WidgetFormBuilder {

  public defaultKey = 'analytics.widgets.resultlist';

  constructor(
    protected collectionService: CollectionService,
    protected mainFormService: MainFormService,
    private defaultValuesService: DefaultValuesService,
    private dialog: MatDialog,
    private colorService: ArlasColorGeneratorLoader
  ) {
    super(collectionService, mainFormService);
  }

  public build() {
    const formGroup = new ResultlistConfigForm(
      this.collectionService.getDescribe(
        this.mainFormService.getMainCollection()
      ));
    this.defaultValuesService.setDefaultValueRecursively(this.defaultKey, formGroup);
    return formGroup;
  }

  public buildWithValues(value: any) {
    const formGroup = this.build();
    // for each column, the related FormGroup must be created before setting its values
    const columns = (value.dataStep || {}).columns || [];
    columns.forEach(c => formGroup.customControls.dataStep.columns
      .push(this.buildColumn()));

    // same for the details, and the fields within
    const details = (value.dataStep || {}).details || [];
    details.forEach(d => {
      const detail = this.buildDetail();
      d.fields.forEach(f => detail.customControls.fields.push(this.buildDetailField()));
      formGroup.customControls.dataStep.details.push(detail);
    });

    formGroup.patchValue(value);
    return formGroup;
  }

  // TODO Optimize by not requesting the collection fields (also for other build methods)
  public buildColumn() {
    const collection = this.mainFormService.getMainCollection();
    const fieldObs = toOptionsObs(this.collectionService.getCollectionFields(collection, NUMERIC_OR_DATE_OR_TEXT_TYPES));
    return new ResultlistColumnFormGroup(
          fieldObs,
          collection,
          this.mainFormService.commonConfig.getKeysToColorFa(),
          this.defaultValuesService.getDefaultConfig(),
          this.dialog,
          this.collectionService,
          this.colorService);
  }

  public buildDetail() {
    return new ResultlistDetailFormGroup();
  }

  public buildDetailField() {
    return new ResultlistDetailFieldFormGroup(
      toOptionsObs(
        this.collectionService.getCollectionFields(
          this.mainFormService.getMainCollection(),
          NUMERIC_OR_DATE_OR_TEXT_TYPES))
    );
  }

}
