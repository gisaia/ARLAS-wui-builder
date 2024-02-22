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
interface InterpolatedValue {
    proportion: number;
}

export interface InterpolatedValueNumber extends InterpolatedValue {
    value: number;
}

export interface InterpolatedValueString extends InterpolatedValue {
    value: string;
}

export interface Propriety {
    propertySource: string;
    propertyFixColor?: string;
    propertyFixSlider?: string;
}

export interface InterpolatedProperty {
    propertyInterpolatedCountOrMetricCtrl?: string;
    propertyInterpolatedCountNormalizeCtrl?: boolean;
    propertyInterpolatedFieldCtrl?: string;
    propertyInterpolatedNormalizeCtrl?: boolean;
    propertyInterpolatedNormalizeByKeyCtrl?: string;
    propertyInterpolatedNormalizeLocalFieldCtrl?: string;
    propertyInterpolatedMinFieldValueCtrl?: number;
    propertyInterpolatedMaxFieldValueCtrl?: number;
    propertyInterpolatedMetricCtrl?: string;
    propertyInterpolatedValuesCtrl?: interpolatedValues[];
    propertyInterpolatedMinValueCtrl?: number;
    propertyInterpolatedMaxValueCtrl?: number;
    propertyInterpolatedValuesButton?: string;
    propertyInterpolatedValuesPreview?: interpolatedValues[];
}

export interface VisibilityStep {
    visible: boolean;
    zoomMin: number;
    zoomMax: number;
    featuresMin: number;
}

export interface GeometryStep {
    aggGeometry: string;
    aggType: string;
    granularity: string;
    clusterGeometryType: string;
    aggregatedGeometry: string;
}

export interface StyleStep {
    geometryType: string;
    filter?: [];
    opacity?: {
        propertySource: string;
        propertyInterpolatedFg?: InterpolatedProperty | any;
    };
    colorFg?: {
        propertySource: string;
        propertyInterpolatedFg?: InterpolatedProperty | any;
    };
    radiusFg?: Propriety;
    strokeColorFg?: Propriety;
    strokeWidthFg?: Propriety;
    strokeOpacityFg?: Propriety;
}

type interpolatedValues = InterpolatedValueString | InterpolatedValueNumber;

// TODO: when we ll be sure of the object structure remove the any.
export interface ModesValues {
    geometryStep: GeometryStep | any;
    styleStep: StyleStep | any;
    visibilityStep: VisibilityStep;
}
