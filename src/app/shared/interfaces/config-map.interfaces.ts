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

export interface StylesStep {
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

export interface ModesValues {
    geometryStep: GeometryStep | any;
    styleStep: StylesStep | any;
    visibilityStep: VisibilityStep;
}
