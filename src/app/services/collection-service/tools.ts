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

const TypeEnum = CollectionReferenceDescriptionProperty.TypeEnum;

export const DATE_TYPES = [
    TypeEnum.DATE, TypeEnum.LONG
];

export const INTEGER_OR_DATE_TYPES = [
    ...DATE_TYPES, TypeEnum.INTEGER
];

export const NUMERIC_OR_DATE_TYPES = [
    ...INTEGER_OR_DATE_TYPES, TypeEnum.DOUBLE, TypeEnum.FLOAT
];

export const NUMERIC_OR_DATE_OR_TEXT_TYPES = [
    ...NUMERIC_OR_DATE_TYPES, TypeEnum.TEXT, TypeEnum.KEYWORD
];

export function toOptionsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
    return collectionFieldsObs.pipe(map(
        fields => fields.map(f => ({ value: f.name, label: f.name, enabled: f.indexed, type: f.type }))
    ));
}

export function toNumericOrDateFieldsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
    return collectionFieldsObs.pipe(map(
        fields => fields
            .filter(f => NUMERIC_OR_DATE_TYPES.indexOf(f.type) >= 0)));
}

export function toDateFieldsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
    return collectionFieldsObs.pipe(map(
        fields => fields.filter(f => DATE_TYPES.indexOf(f.type) >= 0)));
}

export function toIntegerOrDateFieldsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
    return collectionFieldsObs.pipe(map(
        fields => fields.filter(f => INTEGER_OR_DATE_TYPES.indexOf(f.type) >= 0)));
}


export function toNumericOrDateOrKeywordObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
    return toOptionsObs(collectionFieldsObs.pipe(map(
        fields => fields
            .filter(f => f.type === TypeEnum.KEYWORD || NUMERIC_OR_DATE_TYPES.indexOf(f.type) >= 0))));
}

export function toNumericOrDateOptionsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
    return toOptionsObs(toNumericOrDateFieldsObs(collectionFieldsObs));
}

export function toIntegerOptionsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
    return toOptionsObs(collectionFieldsObs.pipe(map(
        fields => fields
            .filter(f => INTEGER_OR_DATE_TYPES.indexOf(f.type) >= 0))));
}

export function toKeywordOptionsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
    return toOptionsObs(collectionFieldsObs.pipe(map(
        fields => fields
            .filter(f => f.type === TypeEnum.KEYWORD))));
}

export function toTextOptionsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
    return toOptionsObs(collectionFieldsObs.pipe(map(
        fields => fields
            .filter(f => f.type === TypeEnum.TEXT))));
}

export function toGeoOptionsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
    return toOptionsObs(collectionFieldsObs.pipe(map(
        fields => fields
            .filter(f => f.type === TypeEnum.GEOPOINT || f.type === TypeEnum.GEOSHAPE))));
}

export function toGeoPointOptionsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
    return toOptionsObs(collectionFieldsObs.pipe(map(
        fields => fields
            .filter(f => f.type === TypeEnum.GEOPOINT))));
}


export function toAllButGeoOptionsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
    return toOptionsObs(collectionFieldsObs.pipe(map(
        fields => fields
            .filter(f => f.type !== TypeEnum.GEOPOINT && f.type !== TypeEnum.GEOSHAPE))));
}

export function toTextOrKeywordOptionsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
    return toOptionsObs(collectionFieldsObs.pipe(map(
        fields => fields
            .filter(f => f.type === TypeEnum.KEYWORD || f.type === TypeEnum.TEXT))));
}

export function titleCase(str) {
    return str.toLowerCase().replace(/./, (x) => x.toUpperCase()).replace(/[^']\b\w/g, (y) => y.toUpperCase());
}
