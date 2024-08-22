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
import { AbstractControl } from '@angular/forms';
import { Filter, Expression } from 'arlas-api';
export interface ImportElement {
  value: any;
  control: AbstractControl;
}

export function importElements(elements: Array<ImportElement>) {
  elements
    .filter(e => e.value !== null)
    .forEach(element => element.control.setValue(element.value));
}

export function stringifyArlasFilter(filter: Filter): string {
  let arlasFilterAsString = '';
  if (!!filter) {
    if (!!filter.f) {
      /** transform AND expressions to a sorted string */
      const andExpressionsAsString = filter.f.map(orExpressions => {
        /** transform OR expressions to a sorted string */
        const orExpressionsAstring = orExpressions.map(exp => stringifyArlasExpression(exp)).sort().join('|');
        return orExpressionsAstring;
      }).sort().join('&');
      arlasFilterAsString += 'arlas-f-' + andExpressionsAsString.trim();
    }
    if (filter.q) {
      /** transform AND expressions to a sorted string */
      const andStrings = filter.f.map(or => {
        /** transform OR expressions to a sorted string */
        const orStrings = or.sort().join('|');
        return orStrings;
      }).sort().join('&');
      arlasFilterAsString += 'arlas-q-' + andStrings.trim();
    }
    if (filter.dateformat) {
      arlasFilterAsString += 'arlas-dateformat-' + filter.dateformat.trim();
    }
    if (filter.righthand) {
      arlasFilterAsString += 'arlas-righthand-true';
    }
  }
  return arlasFilterAsString;
}


export function stringifyArlasExpression(exp: Expression): string {
  return `${exp.field}-${exp.op}-${exp.value}`;
}

export function hashCode(s): number {
  let h = 0;
  if (!s || s.length === 0) {
    return h;
  }
  for (let i = 0; i < s.length; i++) {
    // tslint:disable-next-line: no-bitwise
    h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  }
  return h;
}
