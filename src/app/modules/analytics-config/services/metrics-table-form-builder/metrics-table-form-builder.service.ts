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
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { CollectionService } from '@services/collection-service/collection.service';
import {
  ButtonToggleFormControl,
  ComponentFormControl, ConfigFormGroup,
  HiddenFormControl, InputFormControl, SelectFormControl, SliderFormControl, SlideToggleFormControl
} from '@shared-models/config-form';
import { WidgetConfigFormGroup } from '@shared-models/widget-config-form';
import { WidgetFormBuilder } from '../widget-form-builder';
import { MainFormService } from '@services/main-form/main-form.service';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { FormArray, FormGroup, Validators } from '@angular/forms';
import { MetricsTableDataComponent } from '@analytics-config/components/metrics-table-data/metrics-table-data.component';
import { CollectionConfigFormGroup } from '@shared-models/collection-config-form';
import { titleCase, toKeywordOptionsObs } from '@services/collection-service/tools';
import { Observable } from 'rxjs';
import { CollectionField } from '@services/collection-service/models';
import { Metric } from 'arlas-api';

export class MetricsTableFormGroup extends WidgetConfigFormGroup {
  public constructor(
    collection: string,
    title?: string,
  ) {
    super(collection, {
      title: new InputFormControl(
        !!title ? title : '',
        marker('metricstable title'),
        marker('metricstable title description'),
        ''
      ),
      dataStep: new ConfigFormGroup({
        displaySchema:new HiddenFormControl(true),
        numberOfBuckets: new SliderFormControl(
          10,
          marker('metricstable number of bucket'),
          marker('metricstable number of bucket description'),
          1,
          500,
          10
        ),
        sort: new HiddenFormControl({}, '', { optional: true }),
        subtables: (new FormArray([], {
          validators: Validators.required,
        })),
        customComponent: new ComponentFormControl(
          MetricsTableDataComponent,
          {
            control: () => this.customControls.dataStep.subtables,
            collection: () => this.collection,
            displaySchema: () => this.get('dataStep').get('displaySchema').value
          },
          {
            sort: (event) => this.get('dataStep').get('sort').setValue(event)
          }
        )
      }).withTabName(marker('Data')),

      renderStep: new ConfigFormGroup({

        useColorService: new SlideToggleFormControl(
          '',
          marker('Colorize'),
          '',
          {
            optional: true

          }
        ),
        normaliseBy: new ButtonToggleFormControl(
          'column',
          [
            { label: marker('normalize by column'), value: 'column' },
            { label: marker('normalize globally'), value: 'table' }
          ]
          ,
          marker('metric normalize on description')
        ),
        allowOperatorChange: new SlideToggleFormControl(
          '',
          marker('operator metrics table'),
          marker('operator metrics table description')
        ),
        selectWithCheckbox: new SlideToggleFormControl(
          '',
          marker('checkbox metrics table'),
          marker('checkbox metrics table description')
        ),
        showRowField: new SlideToggleFormControl(
          '',
          marker('showRowField metrics table'),
          marker('showRowField metrics table description')
        ),
        headerDisplayMode: new ButtonToggleFormControl(
          'title',
          [
            { label: marker('Display collection name'), value: 'title' },
            { label: marker('Display collection chip'), value: 'chip' },
            { label: marker('Display both'), value: 'full' }

          ]
          ,
          marker('metric headerDisplayMode on description'),
        ),
      }).withTabName(marker('Render')),
      unmanagedFields: new FormGroup({}) // for consistency with other widgets form builders


    });
  }

  public customGroups = {
    dataStep: this.get('dataStep') as ConfigFormGroup,
    renderStep: this.get('renderStep') as ConfigFormGroup
  };

  public customControls = {
    title: this.get('title') as InputFormControl,
    uuid: this.get('uuid') as HiddenFormControl,
    usage: this.get('usage') as HiddenFormControl,
    dataStep: {
      sort: this.get('dataStep').get('sort') as HiddenFormControl,
      subtables: this.get('dataStep').get('subtables') as FormArray,
      numberOfBuckets: this.get('dataStep').get('numberOfBuckets') as SliderFormControl,
      displaySchema: this.get('dataStep').get('displaySchema') as HiddenFormControl
    },
    renderStep: {
      useColorService: this.get('renderStep').get('useColorService') as SlideToggleFormControl,
      normaliseBy: this.get('renderStep').get('useColorService') as SlideToggleFormControl,
      allowOperatorChange: this.get('renderStep').get('allowOperatorChange') as SlideToggleFormControl,
      selectWithCheckbox: this.get('renderStep').get('selectWithCheckbox') as SlideToggleFormControl,
      headerDisplayMode: this.get('renderStep').get('headerDisplayMode') as ButtonToggleFormControl,
      showRowField: this.get('renderStep').get('showRowField') as SlideToggleFormControl,

    },
    unmanagedFields: {}
  };
}

export class SubTableFormGroup extends CollectionConfigFormGroup {
  public constructor(collection: string,
    collectionService: CollectionService,
    collectionFields: Observable<Array<CollectionField>>
  ) {
    super(collection, {
      collection: new SelectFormControl(
        collection,
        marker('Collection'),
        marker('Subtable collection description'),
        false,
        collectionService.getCollections().map(c => ({ label: c, value: c })),
        {
          optional: false,
          resetDependantsOnChange: true
        }
      ),
      aggregationField: new SelectFormControl(
        '',
        marker('Row field'),
        marker('Row field description'),
        true,
        toKeywordOptionsObs(collectionFields),
        {
          dependsOn: () => [this.customControls.collection],
          onDependencyChange: (control: SelectFormControl) => {
            toKeywordOptionsObs(collectionService
              .getCollectionFields(this.customControls.collection.value))
              .subscribe(collectionFs => {
                control.setSyncOptions(collectionFs);
              });
          }
        }
      ),
      columns: (new FormArray([], {
        validators: Validators.required,
      })),
    });
  }
  public customControls = {
    collection: this.get('collection') as SelectFormControl,
    aggregationField: this.get('aggregationField') as SelectFormControl,
    columns: this.get('columns') as FormArray,
  };
}

export class SubTableColumnFormGroup extends CollectionConfigFormGroup {
  public constructor(collection, collectionService) {
    super(collection, {
      sort: new HiddenFormControl('', '', { optional: true }),
      metricCollectFunction: new SelectFormControl(
        '',
        marker('Column metric'),
        '',
        false,
        ['Count', Metric.CollectFctEnum.AVG.toString(), Metric.CollectFctEnum.CARDINALITY.toString(),
          Metric.CollectFctEnum.MAX.toString(), Metric.CollectFctEnum.MIN.toString(),
          Metric.CollectFctEnum.SUM.toString()].map(value => ({ value: value.toLowerCase(), label: titleCase(value) })),
        {
          optional: false,
          childs: () => [
            this.customControls.metricCollectField
          ]
        }
      ),
      metricCollectField: new SelectFormControl(
        '',
        marker('Column field'),
        '',
        true,
        [],
        {
          optional: true
        }
      ),
    });
  }
  public customControls = {
    sort: this.get('sort') as HiddenFormControl,
    metricCollectFunction: this.get('metricCollectFunction') as SelectFormControl,
    metricCollectField: this.get('metricCollectField') as SelectFormControl
  };

}

@Injectable({
  providedIn: 'root'
})
export class MetricsTableFormBuilderService extends WidgetFormBuilder {

  public defaultKey = 'analytics.widgets.metricstable';

  public constructor(
    protected mainFormService: MainFormService,
    protected collectionService: CollectionService,
    private defaultValuesService: DefaultValuesService
  ) {
    super(collectionService, mainFormService);
  }

  public build(collection: string): MetricsTableFormGroup {
    const formGroup = new MetricsTableFormGroup(
      collection
    );
    this.defaultValuesService.setDefaultValueRecursively(this.defaultKey, formGroup);
    return formGroup;
  }

  public buildWithValues(value: any, collection) {
    if (!value || Object.keys(value).length === 0) {
      const formGroup = this.build(collection);
      return formGroup;
    }
    const formGroup = this.build(collection);
    if (value.dataStep.sort === undefined) {
      value.dataStep.sort = '';
    }

    formGroup.patchValue(value);
    formGroup.customControls.dataStep.numberOfBuckets = value.dataStep.numberOfBuckets;
    formGroup.customControls.dataStep.sort = value.dataStep.sort;
    value.dataStep.subtables.forEach(sb => {
      const subtable = this.buildSubTable(sb.collection);
      subtable.customControls.aggregationField.setValue(sb.aggregationField);
      sb.columns.forEach(c => {
        const column = this.buildSubTableColumn(sb.collection);
        column.customControls.metricCollectFunction.setValue(c.metricCollectFunction);
        column.customControls.metricCollectField.setValue(c.metricCollectField);
        column.customControls.sort.setValue('');
        if (!!value.dataStep.sort) {
          let sortMatch = value.dataStep.sort.collection === sb.collection && value.dataStep.sort.termfield === sb.aggregationField;
          if (value.dataStep.sort.on === 'count') {
            sortMatch = sortMatch && c.metricCollectFunction === 'count';
          } else {
            sortMatch = sortMatch && c.metricCollectFunction === value.dataStep.sort.metric.field
              && c.metricCollectField === value.dataStep.sort.metric.field;
          }
          if (sortMatch) {
            column.customControls.sort.setValue(value.dataStep.sort.order);
          }
        }
        subtable.customControls.columns.push(column);
      });
      formGroup.customControls.dataStep.subtables.push(subtable);
    });
    formGroup.customControls.dataStep.displaySchema.setValue(false);
    return formGroup;
  }

  public buildSubTable(collection: string) {
    const formGroup = new SubTableFormGroup(
      collection,
      this.collectionService,
      this.collectionService.getCollectionFields(collection)
    );
    return formGroup;
  }

  public buildSubTableColumn(collection: string) {
    const formGroup = new SubTableColumnFormGroup(
      collection,
      this.collectionService);
    return formGroup;
  }
}

