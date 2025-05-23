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
import { FILTER_OPERATION } from '@map-config/services/map-layer-form-builder/models';
import { CollectionService, METRIC_TYPES } from '@services/collection-service/collection.service';
import { NUMERIC_TYPES } from '@services/collection-service/tools';
import { Expression } from 'arlas-api';

interface FilterFrom {
    setSyncOptions?: (value: any) => void | any;
    setValue?: (value: any) => void | any;
    enableIf?: (value: any) => void | any;
    syncOptions?:  any;
}

interface ParentControl {
    editing?: boolean;
    customControls?: any;
    editionInfo?: { op: string | Expression.OpEnum; field: any; };
}


export class FilterInputsBuilder {
  protected static getBooleanOperatorList(){
    return [
      { value: FILTER_OPERATION.IS, label: FILTER_OPERATION.IS }
    ];
  }

  protected static getKeywordOperatorList(){
    return[
      { value: FILTER_OPERATION.IN, label: FILTER_OPERATION.IN },
      { value: FILTER_OPERATION.NOT_IN, label: FILTER_OPERATION.NOT_IN }
    ];
  }

  protected static getNumericalOperatorList(){
    return [
      { value: FILTER_OPERATION.EQUAL, label: FILTER_OPERATION.EQUAL },
      { value: FILTER_OPERATION.NOT_EQUAL, label: FILTER_OPERATION.NOT_EQUAL },
      { value: FILTER_OPERATION.RANGE, label: FILTER_OPERATION.RANGE },
      { value: FILTER_OPERATION.OUT_RANGE, label: FILTER_OPERATION.OUT_RANGE },
    ];
  }

  protected static checkEditState(parentControl: ParentControl){
    if (parentControl.editionInfo) {
      // if we change the field/or operation, we are no longer in editing an existing filter but creating a new one
      // we quit edition mode
      if (parentControl.customControls.filterField.value.value !== parentControl.editionInfo.field ||
                parentControl.customControls.filterOperation.value !== parentControl.editionInfo.op
      ) {
        parentControl.editing = false;
      }
    }
  }

  public static keywordsFilter(parentControl: any, control: any, collectionService: CollectionService, collection: string) {
    if (!!parentControl.customControls.filterField.value && !!parentControl.customControls.filterField.value.value &&
        parentControl.customControls.filterField.value.value !== '') {
      if (parentControl.customControls.filterOperation.value === FILTER_OPERATION.IN ||
            parentControl.customControls.filterOperation.value === FILTER_OPERATION.NOT_IN) {
        control.setSyncOptions([]);
        collectionService.getTermAggregation(
          collection,
          parentControl.customControls.filterField.value.value)
          .then(keywords => {
            control.setSyncOptions(keywords.map(k => ({value: k, label: k})));
          });
      } else {
        control.setSyncOptions([]);
      }
    } else {
      control.setSyncOptions([]);
    }
    control.markAsUntouched();
    if (parentControl.editionInfo) {
      // if we change the field/or operation, we are no longer in editing an existing filter but creating a new one
      // we quit edition mode
      if (parentControl.customControls.filterField.value.value !== parentControl.editionInfo.field ||
              parentControl.customControls.filterOperation.value !== parentControl.editionInfo.op
      ) {
        parentControl.editing = false;
      }
    }
    // if we are editing an existing filter, keep the selected items.
    // otherwise there is no way to remember them
    if (!parentControl.editing) {
      control.savedItems = new Set();
      control.selectedMultipleItems = [];
    }
    control.enableIf(parentControl.customControls.filterOperation.value === FILTER_OPERATION.IN ||
          parentControl.customControls.filterOperation.value === FILTER_OPERATION.NOT_IN);
  }

  public static numberFilter<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C) {
    control.enableIf(parentControl.customControls.filterOperation.value === FILTER_OPERATION.EQUAL ||
          parentControl.customControls.filterOperation.value === FILTER_OPERATION.NOT_EQUAL);
  }
  public static maxRangeFilter<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C,
    isLoading: boolean, collectionService: CollectionService, collection: string) {
    this.buildInputRangeValues(parentControl, control, isLoading, METRIC_TYPES.MAX, collectionService, collection);
  }
  public static minRangeFilter<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C, isLoading: boolean,
    collectionService: CollectionService, collection: string) {
    this.buildInputRangeValues(parentControl, control, isLoading, METRIC_TYPES.MIN, collectionService, collection);
  }

  // eslint-disable-next-line max-len
  public static buildInputRangeValues<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C,
    isLoading: boolean, metricType: METRIC_TYPES,  collectionService: CollectionService, collection: string) {
    const doRangeEnable = parentControl.customControls.filterOperation.value === FILTER_OPERATION.RANGE ||
            parentControl.customControls.filterOperation.value === FILTER_OPERATION.OUT_RANGE;
    control.enableIf(doRangeEnable);
    if (doRangeEnable && !isLoading) {
      collectionService.getComputationMetric(
        collection,
        parentControl.customControls.filterField.value.value,
        metricType)
        .then(min =>
          control.setValue(min));
    }
  }
  public static booleanFilter<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C) {
    control.enableIf(parentControl.customControls.filterOperation.value === FILTER_OPERATION.IS);
  }
  public static operationFilter<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C) {
    this.checkEditState(parentControl);
    if (!parentControl.editing) {
      /** update list of available ops according to field type */
      if (parentControl.customControls.filterField.value.type === 'KEYWORD') {
        control.setSyncOptions(this.getKeywordOperatorList());
      } else if (parentControl.customControls.filterField.value.type === 'BOOLEAN') {
        control.setSyncOptions(this.getBooleanOperatorList());
      } else {
        control.setSyncOptions(this.getNumericalOperatorList());
      }
      control.setValue(control.syncOptions[0].value);
    } else {
      // if we are editing an existing filter, keep the selected operation.
      // otherwise there is no way to remember it
      if ((parentControl.customControls.filterOperation.value === FILTER_OPERATION.IN ||
              parentControl.customControls.filterOperation.value === FILTER_OPERATION.NOT_IN)) {
        control.setSyncOptions(this.getKeywordOperatorList());
      } else if (parentControl.customControls.filterOperation.value === FILTER_OPERATION.IS) {
        control.setSyncOptions(this.getBooleanOperatorList());
      } else {
        control.setSyncOptions(this.getNumericalOperatorList());
      }
      control.setValue(parentControl.customControls.filterOperation.value);
    }
  }
}

export class GeoFilterInputsBuilder {
  protected static getBooleanOperatorList(){
    return [
      { value: Expression.OpEnum.Eq, label: Expression.OpEnum.Eq },
    ];
  }

  protected static getKeywordOperatorList(){
    return[
      { value: Expression.OpEnum.Like, label: Expression.OpEnum.Like }
    ];
  }

  protected static getNumericalOperatorList(){
    return [
      { value: Expression.OpEnum.Eq, label: Expression.OpEnum.Eq },
      { value: Expression.OpEnum.Ne, label: Expression.OpEnum.Ne},
      { value: Expression.OpEnum.Gte, label: Expression.OpEnum.Gte },
      { value: Expression.OpEnum.Gt, label: Expression.OpEnum.Gt},
      { value: Expression.OpEnum.Lt, label: Expression.OpEnum.Lt },
      { value: Expression.OpEnum.Lte, label: Expression.OpEnum.Lte },
      { value: Expression.OpEnum.Range, label: Expression.OpEnum.Range }
    ];
  }

  protected static checkEditState(parentControl: ParentControl){
    if (parentControl.editionInfo) {
      // if we change the field/or operation, we are no longer in editing an existing filter but creating a new one
      // we quit edition mode
      if (parentControl.customControls.filterField.value.value !== parentControl.editionInfo.field ||
          parentControl.customControls.filterOperation.value !== parentControl.editionInfo.op
      ) {
        parentControl.editing = false;
      }
    }
  }

  public static keywordsFilter(parentControl: any, control: any, collectionService: CollectionService, collection: string) {
    if (!!parentControl.customControls.filterField.value && !!parentControl.customControls.filterField.value.value &&
        parentControl.customControls.filterField.value.value !== '') {
      if (parentControl.customControls.filterOperation.value === Expression.OpEnum.Like) {
        control.setSyncOptions([]);
        collectionService.getTermAggregation(
          collection,
          parentControl.customControls.filterField.value.value)
          .then(keywords => {
            control.setSyncOptions(keywords.map(k => ({value: k, label: k})));
          });
      } else {
        control.setSyncOptions([]);
      }
    } else {
      control.setSyncOptions([]);
    }
    control.markAsUntouched();
    if (parentControl.editionInfo) {
      // if we change the field/or operation, we are no longer in editing an existing filter but creating a new one
      // we quit edition mode
      if (parentControl.customControls.filterField.value.value !== parentControl.editionInfo.field ||
          parentControl.customControls.filterOperation.value !== parentControl.editionInfo.op
      ) {
        parentControl.editing = false;
      }
    }
    // if we are editing an existing filter, keep the selected items.
    // otherwise there is no way to remember them
    if (!parentControl.editing) {
      control.savedItems = new Set();
      control.selectedMultipleItems = [];
    }
    control.enableIf(parentControl.customControls.filterOperation.value === Expression.OpEnum.Like);
  }

  public static numberFilter<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C) {
    const inputValue = parentControl.customControls.filterOperation.value;
    const enable = (inputValue === Expression.OpEnum.Eq ||
        inputValue === Expression.OpEnum.Ne ||
    inputValue === Expression.OpEnum.Gte ||
    inputValue === Expression.OpEnum.Gt ||
    inputValue === Expression.OpEnum.Lt ||
    inputValue === Expression.OpEnum.Lte) &&
        NUMERIC_TYPES.includes(parentControl.customControls.filterField.value.type);
    control.enableIf(enable);
  }
  public static maxRangeFilter<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C,
    isLoading: boolean, collectionService: CollectionService, collection: string) {
    this.buildInputRangeValues(parentControl, control, isLoading, METRIC_TYPES.MAX, collectionService, collection);
  }
  public static minRangeFilter<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C, isLoading: boolean,
    collectionService: CollectionService, collection: string) {
    this.buildInputRangeValues(parentControl, control, isLoading, METRIC_TYPES.MIN, collectionService, collection);
  }

  // eslint-disable-next-line max-len
  public static buildInputRangeValues<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C,
    isLoading: boolean, metricType: METRIC_TYPES,  collectionService: CollectionService, collection: string) {
    const doRangeEnable = parentControl.customControls.filterOperation.value === Expression.OpEnum.Range;
    control.enableIf(doRangeEnable);
    if (doRangeEnable && !isLoading) {
      collectionService.getComputationMetric(
        collection,
        parentControl.customControls.filterField.value.value,
        metricType)
        .then(min =>
          control.setValue(min));
    }
  }

  public static booleanFilter<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C) {
    control.enableIf(parentControl.customControls.filterOperation.value === Expression.OpEnum.Eq &&
        parentControl.customControls.filterField.value.type === 'BOOLEAN');
  }
  public static operationFilter<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C) {
    this.checkEditState(parentControl);
    if (!parentControl.editing) {
      /** update list of available ops according to field type */
      if (parentControl.customControls.filterField.value.type === 'KEYWORD') {
        control.setSyncOptions(this.getKeywordOperatorList());
      } else if (parentControl.customControls.filterField.value.type === 'BOOLEAN') {
        control.setSyncOptions(this.getBooleanOperatorList());
      } else {
        control.setSyncOptions(this.getNumericalOperatorList());
      }
      control.setValue(control.syncOptions[0].value);
    } else {
      // if we are editing an existing filter, keep the selected operation.
      // otherwise there is no way to remember it
      const operatorValue = parentControl.customControls.filterOperation.value;
      if ((operatorValue === Expression.OpEnum.Like)) {
        control.setSyncOptions(this.getKeywordOperatorList());
      } else if (operatorValue === Expression.OpEnum.Eq  &&
          parentControl.customControls.filterField.value.type === 'BOOLEAN') {
        control.setSyncOptions(this.getBooleanOperatorList());
      } else {
        control.setSyncOptions(this.getNumericalOperatorList());
      }
      control.setValue(parentControl.customControls.filterOperation.value);
    }
  }
}

