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
import { Observable } from 'rxjs';
import { CollectionField } from './models';
import { map } from 'rxjs/operators';
import { CollectionReferenceDescriptionProperty } from 'arlas-api';

export const NUMERIC_OR_DATE_TYPES = [
    CollectionReferenceDescriptionProperty.TypeEnum.DATE, CollectionReferenceDescriptionProperty.TypeEnum.INTEGER,
    CollectionReferenceDescriptionProperty.TypeEnum.LONG, CollectionReferenceDescriptionProperty.TypeEnum.DOUBLE,
    CollectionReferenceDescriptionProperty.TypeEnum.FLOAT
];

export const INTEGER_TYPES = [
    CollectionReferenceDescriptionProperty.TypeEnum.DATE, CollectionReferenceDescriptionProperty.TypeEnum.INTEGER,
    CollectionReferenceDescriptionProperty.TypeEnum.LONG,
];

export function toNumericOrDateOptionsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
    return collectionFieldsObs.pipe(map(
        fields => fields
            .filter(f => NUMERIC_OR_DATE_TYPES.indexOf(f.type) >= 0)
            .map(f => ({ value: f.name, label: f.name }))));
}

export function toIntegerOptionsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
    return collectionFieldsObs.pipe(map(
        fields => fields
            .filter(f => INTEGER_TYPES.indexOf(f.type) >= 0)
            .map(f => ({ value: f.name, label: f.name }))));
}

export function toKeywordOptionsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
    return collectionFieldsObs.pipe(map(
        fields => fields
            .filter(f => f.type === CollectionReferenceDescriptionProperty.TypeEnum.KEYWORD)
            .map(f => ({ value: f.name, label: f.name }))));
}

export function toTextOptionsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
    return collectionFieldsObs.pipe(map(
        fields => fields
            .filter(f => f.type === CollectionReferenceDescriptionProperty.TypeEnum.TEXT)
            .map(f => ({ value: f.name, label: f.name }))));
}

export function toGeoOptionsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
    return collectionFieldsObs.pipe(map(
        fields => fields
            .filter(f => f.type === CollectionReferenceDescriptionProperty.TypeEnum.GEOPOINT
                || f.type === CollectionReferenceDescriptionProperty.TypeEnum.GEOSHAPE)
            .map(f => ({ value: f.name, label: f.name }))));
}

export function toGeoPointOptionsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
    return collectionFieldsObs.pipe(map(
        fields => fields
            .filter(f => f.type === CollectionReferenceDescriptionProperty.TypeEnum.GEOPOINT)
            .map(f => ({ value: f.name, label: f.name }))));
}


export function toAllButGeoOptionsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
    return collectionFieldsObs.pipe(map(
        fields => fields
            .filter(f => f.type !== CollectionReferenceDescriptionProperty.TypeEnum.GEOPOINT
                && f.type !== CollectionReferenceDescriptionProperty.TypeEnum.GEOSHAPE)
            .map(f => ({ value: f.name, label: f.name }))));
}
