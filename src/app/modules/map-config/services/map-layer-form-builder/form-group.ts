import { marker } from '@colsen1991/ngx-translate-extract-marker';
import { CollectionService } from '@services/collection-service/collection.service';
import { CollectionField } from '@services/collection-service/models';
import { toNumericOrDateOrKeywordOrBooleanObs } from '@services/collection-service/tools';
import {
    ButtonToggleFormControl,
    ConfigFormGroup,
    HiddenFormControl,
    InputFormControl,
    MultipleSelectFormControl,
    SelectFormControl,
    TypedSelectFormControl
} from '@shared-models/config-form';
import { FilterInputsBuilder } from '@shared-models/filter-input-builder';
import { valuesToOptions } from '@utils/tools';
import { Observable } from 'rxjs';
import { FILTER_OPERATION } from './models';

export class MapFilterFormGroup extends ConfigFormGroup {
  public editing = false;
  public editionInfo: { field: string; op: FILTER_OPERATION; };
  protected  filter = new FilterInputsBuilder();
  public constructor(
    collectionFields: Observable<Array<CollectionField>>,
    filterOperations: Array<FILTER_OPERATION>,
    collectionService: CollectionService,
    collection: string
  ) {
    super({
      filterField: new TypedSelectFormControl(
        '',
        marker('Filter Field'),
        marker('Filter field description'),
        true,
        toNumericOrDateOrKeywordOrBooleanObs(collectionFields),
        {
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
            this.filter.operationFilter(this, control);
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
            this.filter.keywordsFilter(this, control, collectionService, collection);
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
            this.filter.numberFilter(this, control);
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
            this.filter.minRangeFilter(this, control, isLoading, collectionService, collection);
          }
        },
        () => this.customControls.filterMaxRangeValues,
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
            this.filter.maxRangeFilter(this, control, isLoading, collectionService, collection);
          }
        },
        undefined,
        () => this.customControls.filterMinRangeValues
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
            this.filter.booleanFilter(this, control);
          }
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
    filterInValues: this.get('filterInValues') as MultipleSelectFormControl,
    filterEqualValues: this.get('filterEqualValues') as InputFormControl,
    filterMinRangeValues: this.get('filterMinRangeValues') as InputFormControl,
    filterMaxRangeValues: this.get('filterMaxRangeValues') as InputFormControl,
    filterBoolean: this.get('filterBoolean') as ButtonToggleFormControl,
    id: this.get('id') as HiddenFormControl
  };

}
