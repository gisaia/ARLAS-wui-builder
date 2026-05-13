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
import { HistogramUtils } from 'arlas-d3';

/**
 * Creates a step gradient based on the given palette
 */
@Pipe({
  name: 'stepGradient',
})
export class StepGradientPipe implements PipeTransform {

  public transform(paletteColors: string | [number, number]): string {
    console.log(paletteColors);
    const gradients = new Array<string>();
    for (let i = 0; i <= 11; i += 1) {
      const color = HistogramUtils.getColor(i / 11, paletteColors).toHexString();
      gradients.push(`${color} ${i * 100 / 11}%, ${color} ${(i + 1) * 100 / 11}%`);
    }

    return `linear-gradient(to right, ${gradients.join(', ')})`;
  }

}
