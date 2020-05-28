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
  HiddenFormControl
} from '@shared-models/config-form';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import { FormArray, Validators, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { toOptionsObs, NUMERIC_OR_DATE_OR_TEXT_TYPES } from '@services/collection-service/tools';
import { CollectionReferenceDescription } from 'arlas-api';

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
        columnsWrapper: new ConfigFormGroup({
          columns: new FormArray([], Validators.required)
        })
          .withTitle('Columns'),
        idFieldName: new HiddenFormControl(
          '',
          undefined,
          {
            onDependencyChange: (control) => describe.subscribe(d => control.setValue(d.params.id_path))
          }
        )
      }),
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
      })
    });
  }

  public customControls = {
    dataStep: {
      name: this.get('dataStep.name') as InputFormControl,
      searchSize: this.get('dataStep.searchSize') as SliderFormControl,
      columnsWrapper: {
        columns: this.get('dataStep.columnsWrapper.columns') as FormArray
      },
      idFieldName: this.get('dataStep.idFieldName') as HiddenFormControl,
    },
    renderStep: {
      displayFilters: this.get('renderStep.displayFilters') as SlideToggleFormControl,
      useColorService: this.get('renderStep.useColorService') as SlideToggleFormControl,
      cellBackgroundStyle: this.get('renderStep.cellBackgroundStyle') as SelectFormControl,
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
    const columns = ((value.dataStep || {}).columnsWrapper || {}).columns;
    if (!!columns) {
      columns.forEach(c => formGroup.customControls.dataStep.columnsWrapper.columns
        .push(this.buildColumn()));
    }
    formGroup.patchValue(value);
    return formGroup;
  }

  public buildColumn() {
    return new ResultlistColumnFormGroup(
      toOptionsObs(
        this.collectionService.getCollectionFields(
          this.mainFormService.getCollections()[0],
          NUMERIC_OR_DATE_OR_TEXT_TYPES))
    );
  }

}
