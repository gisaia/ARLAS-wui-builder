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

import { LayerMetadata } from 'arlas-map';

export enum ExternalEvent {
  hover = 'hover',
  select = 'select'
}
export interface ExternalEventLayers {
  id: string;
  on: ExternalEvent;
}

export interface MapConfig {
  layers: Array<Layer>;
  externalEventLayers?: Array<ExternalEventLayers>;
}

export interface Layer {
  id: string;
  type: string;
  source: string;
  layout: Layout;
  minzoom: number;
  maxzoom: number;
  paint: Paint;
  filter?: Array<any>;
  metadata?: LayerMetadata;
}

export interface Layout {
  visibility?: string;
  'line-cap'?: string;
  'line-join'?: string;
  'text-field'?: string;
  'text-size'?: PaintValue;
  'text-font'?: string[];
  'text-rotate'?: PaintValue;
  'text-allow-overlap'?: boolean;
  'text-anchor'?: string;
  'symbol-placement'?: string;
  'circle-sort-key'?: PaintValue;
}

export type PaintValue = ExpressionValue | PaintColor;
export type ExpressionValue =  Array<string | Array<string> | number>  | string | number;
export interface Paint {
  'fill-color'?: PaintValue;
  'fill-opacity'?: number;
  'circle-color'?: PaintValue;
  'circle-opacity'?: number;
  'line-color'?: PaintValue;
  'line-opacity'?: number;
  'line-width'?: PaintValue;
  'line-dasharray'?: PaintValue;
  'circle-radius'?: PaintValue;
  'circle-blur'?: number;
  'circle-stroke-width'?: PaintValue;
  'heatmap-color'?: PaintValue;
  'heatmap-radius'?: PaintValue;
  'heatmap-weight'?: PaintValue;
  'heatmap-intensity'?: number;
  'heatmap-opacity'?: number;
  'text-color'?: PaintValue;
  'text-opacity'?: PaintValue;
  'text-halo-blur'?: PaintValue;
  'text-halo-width'?: PaintValue;
  'text-halo-color'?: PaintValue;
  'fill-extrusion-opacity'?: number;
  'fill-extrusion-color'?: PaintValue;
  'fill-extrusion-height'?: ExpressionValue;
  'text-translate'?: [number, number];

}

export interface PaintColor {
  property: string;
  type: string;
  stops: Array<Array<string>>;
}


export const HOVER_LAYER_PREFIX = 'arlas-hover-';
export const SELECT_LAYER_PREFIX = 'arlas-select-';
export const FILLSTROKE_LAYER_PREFIX = 'arlas-fill_stroke-';
export const EXTRUSION_LAYER_PREFIX = 'arlas-extrusion-';
export const ARLAS_ID = 'arlas_id:';


export function isTechnicalArlasLayer(id: string) {
  return id.startsWith(HOVER_LAYER_PREFIX) || id.startsWith(SELECT_LAYER_PREFIX) || id.startsWith(FILLSTROKE_LAYER_PREFIX);
}
