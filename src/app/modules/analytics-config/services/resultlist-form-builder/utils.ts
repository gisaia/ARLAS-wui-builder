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

import { CollectionService } from '@services/collection-service/collection.service';
import { NUMERIC_OR_DATE_OR_TEXT_TYPES, toOptionsObs } from '@services/collection-service/tools';
import { ResultlistDetailFieldFormGroup } from './form-group';
import {marker} from '@colsen1991/ngx-translate-extract-marker';

export function buildDetailField(collectionService: CollectionService, collection: string) {
  return new ResultlistDetailFieldFormGroup(
    toOptionsObs(
      collectionService.getCollectionFields(collection, NUMERIC_OR_DATE_OR_TEXT_TYPES))
  );
}

/**
 * Result mode enum
 */
export enum ResultListDefaultMode {
  grid = 'grid',
  list = 'list',
}

/**
 *  Default result mode selection
 */
export const resultModeDefaultList = [
  {label: marker('List mode'), value: ResultListDefaultMode.list},
];

/**
 * Returns a list of result list modes depending on whether grid mode is enabled
 * @param isGridEnabled
 */
export function getDefaultModeList(isGridEnabled: boolean){
  if(isGridEnabled){
    return  [...resultModeDefaultList, {label: marker('Grid mode'), value: ResultListDefaultMode.grid}];
  } else {
    return resultModeDefaultList;
  }
}
