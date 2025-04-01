import { FILTER_OPERATION } from '@map-config/services/map-layer-form-builder/models';

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
    filterField: {value: string;};
    filterOperation: FILTER_OPERATION ;
    filterValues: {
        filterInValues: any[];
        filterEqualValues: number;
        filterMinRangeValues: number;
        filterMaxRangeValues: number;
        filterBoolean: boolean;
    };
}
