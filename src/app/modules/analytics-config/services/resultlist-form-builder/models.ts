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

import { Expression } from 'arlas-api';

export function isNumberOperator(filter: Expression.OpEnum){
  return filter === Expression.OpEnum['eq'] ||
        filter === Expression.OpEnum['ne'] ||
        filter === Expression.OpEnum['gte'] ||
        filter === Expression.OpEnum['gt'] ||
        filter === Expression.OpEnum['lt'] ||
        filter === Expression.OpEnum['lte'];
}

export interface ResultListVisualisationFormWidget {
    'name': string;
    'description': string;
    'dataGroups': ResultListVisualisationDataGroupFormWidget[];
}


export interface ResultListVisualisationDataGroupFormWidget {
    name: string;
    protocol: string;
    visualisationUrl: string;
    filters: ResultListVisualisationConditionFormWidget[];
}

export  interface ResultListVisualisationConditionFormWidget {
    filterField: {value: string; type: string;};
    filterOperation: Expression.OpEnum;
    filterValues: {
        filterInValues: any[];
        filterEqualValues: number;
        filterMinRangeValues: number;
        filterMaxRangeValues: number;
        filterBoolean: boolean;
    };
}
