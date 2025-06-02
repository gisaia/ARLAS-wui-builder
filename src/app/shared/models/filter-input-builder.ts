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
  ArlasApiFilter,
  eqArlasApiFilter,
  gtArlasApiFilter,
  gteArlasApiFilter, isNumberOperator,
  likeArlasApiFilter,
  ltArlasApiFilter,
  lteArlasApiFilter,
  neArlasApiFilter,
  rangeArlasApiFilter
} from '@analytics-config/services/resultlist-form-builder/models';
import { FILTER_OPERATION } from '@map-config/services/map-layer-form-builder/models';
import { CollectionService, METRIC_TYPES } from '@services/collection-service/collection.service';
import { NUMERIC_TYPES } from '@services/collection-service/tools';
import { Expression } from 'arlas-api';

interface FilterFrom {
    setSyncOptions?: (value: any) => void;
    setValue?: (value: any) => void;
    enableIf?: (value: any) => void ;
    syncOptions?:  any;
}

interface ParentControl {
    editing?: boolean;
    customControls?: any;
    editionInfo?: { op: string | ArlasApiFilter; field: any; };
}

abstract class InputFilter<V, L> {
  /**
   * return available operators  for type boolean
   * @returns {{value: V, label: L}[]}
   * @protected
   */
  protected abstract getBooleanOperatorList(): { value: V; label: L; }[];

  /**
   * return available operators  for type string
   * @returns {{value: V, label: L}[]}
   * @protected
   */
  protected abstract getKeywordOperatorList(): { value: V; label: L; }[];
  /**
   * return available operators for type number
   * @returns {{value: V, label: L}[]}
   * @protected
   */
  protected abstract  getNumericalOperatorList(): { value: V; label: L; }[];

  /**
   * check if the inputs are in edit mode or not
   * @param {ParentControl} parentControl
   * @protected
   */
  protected checkEditState(parentControl: ParentControl){
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

  /**
   * Enable text value selection
   * @param parentControl
   * @param control
   * @param {CollectionService} collectionService
   * @param {string} collection
   */
  public abstract keywordsFilter(parentControl: any, control: any, collectionService: CollectionService, collection: string);

  /**
   * Enable inputs if the column type is number and if the operator match
   * @param {P} parentControl
   * @param {C} control
   */
  public abstract numberFilter<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C);

  /**
   * Fetch the necessary values for the max input
   * @param {P} parentControl
   * @param {C} control
   * @param {boolean} isLoading
   * @param {CollectionService} collectionService
   * @param {string} collection
   */
  public maxRangeFilter<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C,
    isLoading: boolean, collectionService: CollectionService, collection: string) {
    this.buildInputRangeValues(parentControl, control, isLoading, METRIC_TYPES.MAX, collectionService, collection);
  }

  /**
   * Fetch the necessary values for the min input
   * @param {P} parentControl
   * @param {C} control
   * @param {boolean} isLoading
   * @param {CollectionService} collectionService
   * @param {string} collection
   */
  public minRangeFilter<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C, isLoading: boolean,
    collectionService: CollectionService, collection: string) {
    this.buildInputRangeValues(parentControl, control, isLoading, METRIC_TYPES.MIN, collectionService, collection);
  }

  /**
   * Enable range inputs  if the column type is number
   * @param {P} parentControl
   * @param {C} control
   * @param {boolean} isLoading
   * @param {ComputationRequest.MetricEnum} metricType
   * @param {CollectionService} collectionService
   * @param {string} collection
   */
  public abstract buildInputRangeValues<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C,
    isLoading: boolean, metricType: METRIC_TYPES,  collectionService: CollectionService, collection: string);

  /**
   * Enable boolean values if the column type is boolean
   * @param {P} parentControl
   * @param {C} control
   */
  public abstract booleanFilter<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C);

  /**
   * Help select the good operator according to the column selected
   * @param {P} parentControl
   * @param {C} control
   */
  public operationFilter<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C) {
    this.checkEditState(parentControl);
    if (!parentControl.editing) {
      /** update list of available ops according to field type */
      this.setDefaultOperationFilter(parentControl, control);
    } else {
      this.setOperationFilterWhenEdition(parentControl, control);
    }
  }

  /**
   * Set the operator when there is a value selected
   * @param {P} parentControl
   * @param {C} control
   */
  public abstract setOperationFilterWhenEdition<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C): void;

  /**
   * Set operator when there is no value selected yet
   * @param {P} parentControl
   * @param {C} control
   */
  public setDefaultOperationFilter<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C) {
    /** update list of available ops according to field type */
    if (parentControl.customControls.filterField.value.type === 'KEYWORD') {
      control.setSyncOptions(this.getKeywordOperatorList());
    } else if (parentControl.customControls.filterField.value.type === 'BOOLEAN') {
      control.setSyncOptions(this.getBooleanOperatorList());
    } else {
      control.setSyncOptions(this.getNumericalOperatorList());
    }
    control.setValue(control.syncOptions[0].value);
  }

  public setRangeControlWithComputationMetric<P extends  ParentControl, C extends FilterFrom>
  (collectionService: CollectionService, collection: string, parentControl: P, control: C, metricType: METRIC_TYPES){
    collectionService.getComputationMetric(
      collection,
      parentControl.customControls.filterField.value.value,
      metricType)
      .then(min =>
        control.setValue(min));
  }

  public  setKeywordsFilterWithTermAgg<P extends  ParentControl, C extends FilterFrom>
  (parentControl: P, control: C, collectionService: CollectionService, collection: string) {
    collectionService.getTermAggregation(
      collection,
      parentControl.customControls.filterField.value.value)
      .then(keywords => {
        control.setSyncOptions(keywords.map(k => ({value: k, label: k})));
      });
  }

  public manageParentControlEditState<P extends  ParentControl>(parentControl: P){
    if (parentControl.editionInfo) {
      // if we change the field/or operation, we are no longer editing an existing filter but creating a new one
      // we quit edition mode
      if (parentControl.customControls.filterField.value.value !== parentControl.editionInfo.field ||
          parentControl.customControls.filterOperation.value !== parentControl.editionInfo.op
      ) {
        parentControl.editing = false;
      }
    }
  }
}

/**
 *  class used in map form builder
 */
export class FilterInputsBuilder extends InputFilter<FILTER_OPERATION, FILTER_OPERATION>{
  protected getBooleanOperatorList(){
    return [
      { value: FILTER_OPERATION.IS, label: FILTER_OPERATION.IS }
    ];
  }

  protected getKeywordOperatorList(){
    return[
      { value: FILTER_OPERATION.IN, label: FILTER_OPERATION.IN },
      { value: FILTER_OPERATION.NOT_IN, label: FILTER_OPERATION.NOT_IN }
    ];
  }

  protected getNumericalOperatorList(){
    return [
      { value: FILTER_OPERATION.EQUAL, label: FILTER_OPERATION.EQUAL },
      { value: FILTER_OPERATION.NOT_EQUAL, label: FILTER_OPERATION.NOT_EQUAL },
      { value: FILTER_OPERATION.RANGE, label: FILTER_OPERATION.RANGE },
      { value: FILTER_OPERATION.OUT_RANGE, label: FILTER_OPERATION.OUT_RANGE },
    ];
  }

  public keywordsFilter(parentControl: any, control: any, collectionService: CollectionService, collection: string) {
    if (!!parentControl.customControls.filterField.value && !!parentControl.customControls.filterField.value.value &&
        parentControl.customControls.filterField.value.value !== '') {
      if (parentControl.customControls.filterOperation.value === FILTER_OPERATION.IN ||
            parentControl.customControls.filterOperation.value === FILTER_OPERATION.NOT_IN) {
        control.setSyncOptions([]);
        this.setKeywordsFilterWithTermAgg(parentControl, control, collectionService, collection);
      } else {
        control.setSyncOptions([]);
      }
    } else {
      control.setSyncOptions([]);
    }
    control.markAsUntouched();
    this.manageParentControlEditState(parentControl);
    // if we are editing an existing filter, keep the selected items.
    // otherwise there is no way to remember them
    if (!parentControl.editing) {
      control.savedItems = new Set();
      control.selectedMultipleItems = [];
    }
    control.enableIf(parentControl.customControls.filterOperation.value === FILTER_OPERATION.IN ||
          parentControl.customControls.filterOperation.value === FILTER_OPERATION.NOT_IN);
  }

  public numberFilter<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C) {
    control.enableIf(parentControl.customControls.filterOperation.value === FILTER_OPERATION.EQUAL ||
          parentControl.customControls.filterOperation.value === FILTER_OPERATION.NOT_EQUAL);
  }
  public maxRangeFilter<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C,
    isLoading: boolean, collectionService: CollectionService, collection: string) {
    this.buildInputRangeValues(parentControl, control, isLoading, METRIC_TYPES.MAX, collectionService, collection);
  }
  public minRangeFilter<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C, isLoading: boolean,
    collectionService: CollectionService, collection: string) {
    this.buildInputRangeValues(parentControl, control, isLoading, METRIC_TYPES.MIN, collectionService, collection);
  }

  // eslint-disable-next-line max-len
  public buildInputRangeValues<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C,
    isLoading: boolean, metricType: METRIC_TYPES,  collectionService: CollectionService, collection: string) {
    const doRangeEnable = parentControl.customControls.filterOperation.value === FILTER_OPERATION.RANGE ||
            parentControl.customControls.filterOperation.value === FILTER_OPERATION.OUT_RANGE;
    control.enableIf(doRangeEnable);
    if (doRangeEnable && !isLoading) {
      this.setRangeControlWithComputationMetric(collectionService, collection, parentControl, control, metricType);
    }
  }
  public booleanFilter<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C) {
    control.enableIf(parentControl.customControls.filterOperation.value === FILTER_OPERATION.IS);
  }

  public setOperationFilterWhenEdition<P extends ParentControl, C extends FilterFrom>(parentControl: P, control: C) {
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

export class GeoFilterInputsBuilder  extends InputFilter<ArlasApiFilter, Expression.OpEnum> {
  protected  getBooleanOperatorList(){
    return [
      { value: eqArlasApiFilter, label: Expression.OpEnum.Eq },
    ];
  }

  protected  getKeywordOperatorList(){
    return[
      { value: likeArlasApiFilter, label: Expression.OpEnum.Like }
    ];
  }

  protected  getNumericalOperatorList(){
    return [
      { value: eqArlasApiFilter, label: Expression.OpEnum.Eq },
      { value: neArlasApiFilter, label: Expression.OpEnum.Ne},
      { value: gteArlasApiFilter, label: Expression.OpEnum.Gte },
      { value: gtArlasApiFilter, label: Expression.OpEnum.Gt},
      { value: ltArlasApiFilter, label: Expression.OpEnum.Lt },
      { value: lteArlasApiFilter, label: Expression.OpEnum.Lte },
      { value: rangeArlasApiFilter, label: Expression.OpEnum.Range }
    ];
  }

  public keywordsFilter(parentControl: any, control: any, collectionService: CollectionService, collection: string) {
    if (!!parentControl.customControls.filterField.value && !!parentControl.customControls.filterField.value.value &&
        parentControl.customControls.filterField.value.value !== '') {
      if (parentControl.customControls.filterOperation.value === likeArlasApiFilter) {
        control.setSyncOptions([]);
        this.setKeywordsFilterWithTermAgg(parentControl, control, collectionService, collection);
      } else {
        control.setSyncOptions([]);
      }
    } else {
      control.setSyncOptions([]);
    }
    control.markAsUntouched();
    this.manageParentControlEditState(parentControl);
    // if we are editing an existing filter, keep the selected items.
    // otherwise there is no way to remember them
    if (!parentControl.editing) {
      control.savedItems = new Set();
      control.selectedMultipleItems = [];
    }
    control.enableIf(parentControl.customControls.filterOperation.value === likeArlasApiFilter);
  }

  public numberFilter<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C) {
    const inputValue = parentControl.customControls.filterOperation.value;
    const enable = isNumberOperator(inputValue) &&
        NUMERIC_TYPES.includes(parentControl.customControls.filterField.value.type);
    control.enableIf(enable);
  }

  // eslint-disable-next-line max-len
  public buildInputRangeValues<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C,
    isLoading: boolean, metricType: METRIC_TYPES,  collectionService: CollectionService, collection: string) {
    const doRangeEnable = parentControl.customControls.filterOperation.value === rangeArlasApiFilter;
    control.enableIf(doRangeEnable);
    if (doRangeEnable && !isLoading) {
      this.setRangeControlWithComputationMetric(collectionService, collection, parentControl, control, metricType);
    }
  }

  public booleanFilter<P extends  ParentControl, C extends FilterFrom>(parentControl: P, control: C) {
    control.enableIf(parentControl.customControls.filterOperation.value === eqArlasApiFilter &&
        parentControl.customControls.filterField.value.type === 'BOOLEAN');
  }

  public setOperationFilterWhenEdition<P extends ParentControl, C extends FilterFrom>(parentControl: P, control: C) {
    // if we are editing an existing filter, keep the selected operation.
    // otherwise there is no way to remember it
    const operatorValue = parentControl.customControls.filterOperation.value;
    if ((operatorValue === likeArlasApiFilter)) {
      control.setSyncOptions(this.getKeywordOperatorList());
    } else if (operatorValue === eqArlasApiFilter  &&
        parentControl.customControls.filterField.value.type === 'BOOLEAN') {
      control.setSyncOptions(this.getBooleanOperatorList());
    } else {
      control.setSyncOptions(this.getNumericalOperatorList());
    }
    control.setValue(parentControl.customControls.filterOperation.value);
  }
}

