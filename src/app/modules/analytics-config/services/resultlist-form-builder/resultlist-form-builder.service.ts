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
  ComponentFormControl
} from '@shared-models/config-form';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import { FormArray, Validators, FormGroup, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { toOptionsObs, NUMERIC_OR_DATE_OR_TEXT_TYPES } from '@services/collection-service/tools';
import { CollectionReferenceDescription } from 'arlas-api';
import { ResultlistDataComponent } from '@analytics-config/components/resultlist-data/resultlist-data.component';

export class ResultlistConfigForm extends ConfigFormGroup {

  constructor(
    describe: Observable<CollectionReferenceDescription>
  ) {
    super({
      dataStep: new ConfigFormGroup({
        name: new InputFormControl(
          '',
          'title',
          'description',
          undefined,
          {
            childs: () => [this.customControls.dataStep.idFieldName]
          }
        ),
        searchSize: new SliderFormControl(
          '',
          'Search size',
          'description',
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
            onDependencyChange: (control) => describe.subscribe(d => control.setValue(d.params.id_path))
          }
        ),
        customComponent: new ComponentFormControl(
          ResultlistDataComponent,
          {
            control: () => this.customGroups.dataStep
          }
        )
      }).withTabName('Data'),
      renderStep: new ConfigFormGroup({
        displayFilters: new SlideToggleFormControl(
          '',
          'Display filters',
          'Description'
        ),
        useColorService: new SlideToggleFormControl(
          '',
          'Display filters',
          'Description'
        ),
        cellBackgroundStyle: new SelectFormControl(
          '',
          'Background style of cells',
          'Description',
          false,
          [
            { label: 'Filled', value: 'filled' },
            { label: 'Outlined', value: 'outlined' },
          ],
          {
            dependsOn: () => [this.customControls.renderStep.useColorService],
            onDependencyChange: (control) => control.enableIf(this.customControls.renderStep.useColorService.value)
          }
        )
      }).withTabName('Render'),
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
    dataStep: {
      name: this.get('dataStep.name') as InputFormControl,
      searchSize: this.get('dataStep.searchSize') as SliderFormControl,
      columns: this.get('dataStep.columns') as FormArray,
      details: this.get('dataStep.details') as FormArray,
      idFieldName: this.get('dataStep.idFieldName') as HiddenFormControl,
    },
    renderStep: {
      displayFilters: this.get('renderStep.displayFilters') as SlideToggleFormControl,
      useColorService: this.get('renderStep.useColorService') as SlideToggleFormControl,
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

export class ResultlistColumnFormGroup extends FormGroup {

  constructor(fieldsObs: Observable<Array<SelectOption>>) {
    super({
      columnName: new InputFormControl(
        '',
        'Column name',
        ''
      ),
      fieldName: new SelectFormControl(
        '',
        'Field',
        '',
        true,
        fieldsObs
      ),
      dataType: new InputFormControl(
        '',
        'Unit of the column',
        '',
        undefined,
        {
          optional: true
        }
      ),
      process: new TextareaFormControl(
        '',
        'Transformation',
        '',
        1,
        {
          optional: true
        }
      ),
    });
  }

  public customControls = {
    columnName: this.get('columnName') as InputFormControl,
    fieldName: this.get('fieldName') as SelectFormControl,
    dataType: this.get('dataType') as InputFormControl,
    process: this.get('process') as TextareaFormControl,
  };
}

export class ResultlistDetailFormGroup extends FormGroup {

  constructor() {
    super({
      name: new InputFormControl(
        '',
        'Section',
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
        'Field name',
        ''
      ),
      path: new SelectFormControl(
        '',
        'Field',
        '',
        true,
        fieldsObs
      ),
      process: new TextareaFormControl(
        '',
        'Transformation',
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
    private formBuilderDefault: FormBuilderWithDefaultService,
  ) {
    super(collectionService, mainFormService);
  }

  public build() {
    const formGroup = new ResultlistConfigForm(
      this.collectionService.getDescribe(
        this.mainFormService.getCollections()[0]
      ));
    this.formBuilderDefault.setDefaultValueRecursively(this.defaultKey, formGroup);
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
    return new ResultlistColumnFormGroup(
      toOptionsObs(
        this.collectionService.getCollectionFields(
          this.mainFormService.getCollections()[0],
          NUMERIC_OR_DATE_OR_TEXT_TYPES))
    );
  }

  public buildDetail() {
    return new ResultlistDetailFormGroup();
  }

  public buildDetailField() {
    return new ResultlistDetailFieldFormGroup(
      toOptionsObs(
        this.collectionService.getCollectionFields(
          this.mainFormService.getCollections()[0],
          NUMERIC_OR_DATE_OR_TEXT_TYPES))
    );
  }

}
