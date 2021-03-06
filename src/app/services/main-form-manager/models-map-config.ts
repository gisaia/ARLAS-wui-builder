import { AnalyticComponentInputConfig } from './models-config';
/*
Licensed to Gisaïa under one or more contributor
license agreements. See the NOTICE.txt file distributed with
this work for additional information regarding copyright
ownership. Gisaïa licenses this file to you under
the Apache License, Version 2.0 (the "License"); you may
not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/

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
    metadata?: any;
}

export interface Layout {
    visibility?: string;
    'line-cap'?: string;
    'line-join'?: string;
}

type PaintValue = Array<string | Array<string> | number> | PaintColor | string | number;
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
    'circle-stroke-width'?: PaintValue;
    'heatmap-color'?: PaintValue;
    'heatmap-radius'?: PaintValue;
    'heatmap-weight'?: PaintValue;
    'heatmap-intensity'?: number;
    'heatmap-opacity'?: number;
}

export interface PaintColor {
    property: string;
    type: string;
    stops: Array<Array<string>>;
}


export const HOVER_LAYER_PREFIX = 'arlas-hover-';
export const SELECT_LAYER_PREFIX = 'arlas-select-';
