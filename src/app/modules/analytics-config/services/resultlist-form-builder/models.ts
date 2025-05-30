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

export type ArlasApiFilter = keyof typeof Expression.OpEnum;
export const eqArlasApiFilter: ArlasApiFilter  = 'Eq';
export const neArlasApiFilter: ArlasApiFilter  = 'Ne';
export const gteArlasApiFilter: ArlasApiFilter  = 'Gte';
export const gtArlasApiFilter: ArlasApiFilter  = 'Gt';
export const ltArlasApiFilter: ArlasApiFilter  = 'Lt';
export const lteArlasApiFilter: ArlasApiFilter  = 'Lte';
export const likeArlasApiFilter: ArlasApiFilter  = 'Like';
export const rangeArlasApiFilter: ArlasApiFilter  = 'Range';

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
    filterField: {value: string;type: string;};
    filterOperation: ArlasApiFilter ;
    filterValues: {
        filterInValues: any[];
        filterEqualValues: number;
        filterMinRangeValues: number;
        filterMaxRangeValues: number;
        filterBoolean: boolean;
    };
}
