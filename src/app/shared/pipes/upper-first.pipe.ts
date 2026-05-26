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

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'upperFirst',
})
export class UpperFirstPipe implements PipeTransform {

  /**
   * Capitalizes the first character of a string
   * @param value String to capitalize
   * @param removeLanguageSpecifiers Whether to remove language specifiers (l', le, la in French, the in English)
   */
  public transform(value: string, removeLanguageSpecifiers = false): string {
    if (!value) {
      return value;
    }

    // Remove language specifiers (English & French)
    if (removeLanguageSpecifiers) {
      if (value.toLowerCase().startsWith('l\'')) {
        value = value.slice(2);
      } else if (value.toLowerCase().startsWith('le ') || value.toLowerCase().startsWith('la ')) {
        value = value.slice(3);
      } else if (value.toLowerCase().startsWith('the ')) {
        value = value.slice(4);
      }
    }

    let firstLetterIndex = -1;
    let i = 0;
    for (const char of value) {
      // If character is a letter or can be capitalized (like letters with accents)
      if (/[a-zA-Z]/.test(char) || char.toUpperCase() !== char) {
        firstLetterIndex = i;
        break;
      }
      i++;
    }

    if (firstLetterIndex < 0) {
      return value;
    }

    return value.slice(0, firstLetterIndex) + value.charAt(firstLetterIndex).toUpperCase() + value.slice(firstLetterIndex + 1);
  }
}
