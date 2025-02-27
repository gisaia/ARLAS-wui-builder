import { Pipe, PipeTransform } from '@angular/core';
import {
  ResultListVisualisationsFormGroup, ResultListVisualisationsItemFamily
} from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder.service';
import { FormArray } from '@angular/forms';
import { ConfigFormGroup } from '@shared-models/config-form';

@Pipe({
  name: 'castVisualisationItemFamily',
  standalone: true
})
export class CastVisualisationItemFamilyPipe implements PipeTransform {

  public transform(item: ResultListVisualisationsFormGroup) {
    return item.get('itemsFamilies') as FormArray<ResultListVisualisationsItemFamily>;
  }

}

@Pipe({
  name: 'castToConfigFormGroup',
  standalone: true
})
export class CastToConfigFormGroupPipe implements PipeTransform {

  public transform(item: any) {
    return item as ConfigFormGroup;
  }
}
