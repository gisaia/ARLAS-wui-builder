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
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import {
  Aggregation, AggregationResponse, AggregationsRequest, CollectionReferenceDescription, CollectionReferenceDescriptionProperty,
  ComputationRequest, Filter, Hits
} from 'arlas-api';
import { projType } from 'arlas-web-core';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { from, Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { CollectionField, CollectionItem, GroupCollectionItem } from './models';

export import FIELD_TYPES = CollectionReferenceDescriptionProperty.TypeEnum;
export import METRIC_TYPES = ComputationRequest.MetricEnum;

@Injectable({
  providedIn: 'root'
})
export class CollectionService {

  private collectionsDescriptions = new Map<string, Observable<CollectionReferenceDescription>>();
  public taggableFieldsMap = new Map<string, Set<string>>();
  public collectionParamsMap = new Map<string, CollectionReferenceDescription>();
  public collectionMinIntervalMap = new Map<string, number>();
  public collectionMaxIntervalMap = new Map<string, number>();
  public collections: string[] = [];
  public groupCollectionItems: GroupCollectionItem = {
    collections: [],
    owner: [],
    shared: [],
    public: []
  };
  public constructor(
    private collabSearchService: ArlasCollaborativesearchService,
    private spinner: NgxSpinnerService,
    private defaultValueService: DefaultValuesService,
    private translate: TranslateService
  ) { }

  public getCollections(): string[] {
    return this.collections;
  }

  public getCollectionsWithCentroid(): string[] {
    return this.getCollections().filter(c => !!this.collectionParamsMap.get(c) && !!this.collectionParamsMap.get(c).params.centroid_path);
  }

  public setCollections(collections: string[]): void {
    this.collections = collections;
  }

  public setGroupCollectionItems(groupCollectionItems: GroupCollectionItem): void {
    this.groupCollectionItems = groupCollectionItems;
  }

  public getGroupCollectionItems(): GroupCollectionItem {
    return this.groupCollectionItems;
  }

  public getGroupCollectionItemsWithCentroid(): GroupCollectionItem {
    const filterFuncion = (c) => !!this.collectionParamsMap.get(c.name) && !!this.collectionParamsMap.get(c.name).params.centroid_path;
    const groupCollectionItem = {};
    Object.keys(this.groupCollectionItems).forEach(k => {
      groupCollectionItem[k] = this.groupCollectionItems[k].filter(filterFuncion);
    });
    return groupCollectionItem as GroupCollectionItem;
  }

  public setCollectionsRef(crds: CollectionReferenceDescription[]): void {
    crds.forEach(c => {
      const collectionName = c.collection_name;
      this.collectionParamsMap.set(collectionName, c);
      this.collabSearchService.resolveButNotComputation(
        [projType.compute,
        {
          filter: null,
          field: this.collectionParamsMap.get(collectionName).params.timestamp_path,
          metric: ComputationRequest.MetricEnum.MAX
        } as ComputationRequest],
        new Map(), collectionName)
        .subscribe(
          response => !!response.value ? this.collectionMaxIntervalMap.set(collectionName, response.value) : ''
        );

      this.collabSearchService.resolveButNotComputation(
        [projType.compute,
        {
          filter: null,
          field: this.collectionParamsMap.get(collectionName).params.timestamp_path,
          metric: ComputationRequest.MetricEnum.MIN
        } as ComputationRequest],
        new Map(), collectionName)
        .subscribe(
          response => !!response.value ? this.collectionMinIntervalMap.set(collectionName, response.value) : ''
        );
    });
  }

  public getCollectionsReferenceDescription(): Observable<CollectionReferenceDescription[]> {
    return this.collabSearchService.list().pipe(map((collections) => collections
      .filter(collection => collection.collection_name !== 'metacollection')));
  }

  public getDescribe(collection: string): Observable<CollectionReferenceDescription> {
    const describtionObs = this.collectionsDescriptions.get(collection);
    if (!describtionObs) {
      const describe = this.collabSearchService.describe(collection);
      this.collectionsDescriptions.set(collection, describe);
      describe.subscribe(cd => {
        this.collectionParamsMap.set(collection, cd);
      });

      return describe;
    } else {
      return describtionObs;
    }
  }

  public getCollectionFields(collection: string, types?: Array<FIELD_TYPES>, exclude: boolean = false): Observable<Array<CollectionField>> {

    this.spinner.show();

    const result: Observable<Array<CollectionField>> = this.getDescribe(collection).pipe(map(
      (c: CollectionReferenceDescription) => {
        const getSubFields = (properties: CollectionReferenceDescriptionProperty, parentPath?: string):
          Array<CollectionField> => {
          if (properties !== null && properties !== undefined) {
            return Object.keys(properties).flatMap(key => {
              const path = parentPath ? parentPath + '.' + key : key;
              const property = properties[key];
              if (property.type === CollectionReferenceDescriptionProperty.TypeEnum.OBJECT) {
                return getSubFields(property.properties, path);

              } else if (!exclude && (!types || types.includes(property.type))) {
                if (property && property.taggable) {
                  let taggableFields = this.taggableFieldsMap.get(collection);
                  if (!taggableFields) {
                    taggableFields = new Set<string>();
                  }
                  taggableFields.add(path);
                  this.taggableFieldsMap.set(collection, taggableFields);
                }
                return { name: path, type: property.type, indexed: property.indexed };
              } else if (exclude && (!types || !types.includes(property.type))) {
                if (property && property.taggable) {
                  let taggableFields = this.taggableFieldsMap.get(collection);
                  if (!taggableFields) {
                    taggableFields = new Set<string>();
                  }
                  taggableFields.add(path);
                  this.taggableFieldsMap.set(collection, taggableFields);
                }
                return { name: path, type: property.type, indexed: property.indexed };
              } else {
                return null;
              }
            }).filter(p => p !== null && p !== undefined);
          }
        };
        return getSubFields(c.properties).sort();
      }))
      .pipe(finalize(() => this.spinner.hide()));
    return result;
  }

  public getCollectionFieldsNames(collection: string, types?: Array<FIELD_TYPES>, exclude: boolean = false) {
    return this.getCollectionFields(collection, types, exclude).pipe(map(
      fields => fields.map(f => f.name)
    ));
  }

  public getComputationMetric(collection: string, field: string, metric: METRIC_TYPES) {

    const computation: ComputationRequest = {
      field,
      metric
    };
    this.spinner.show();
    return this.collabSearchService.getExploreApi().computePost(collection, computation, false, 120,
      this.collabSearchService.getFetchOptions())
      .then(ag => {
        this.spinner.hide();

        // Round the value returned by ARLAS SERVER to improve the lisibility
        return Math.round(ag.value * 100) / 100;
      })
      .finally(() => this.spinner.hide());
  }

  public countNbDocuments(collection: string): Observable<Hits> {
    return this.collabSearchService.resolveButNotHits([projType.count, {}],
      this.collabSearchService.collaborations, collection, null, null, false, 120);
  }

  public getTermAggregation(
    collection: string,
    field: string,
    showSpinner: boolean = true,
    filter?: Filter,
    prefix?: string
  ): Promise<Array<string>> {

    if (showSpinner) {
      this.spinner.show();
    }
    const aggregation: Aggregation = {
      type: Aggregation.TypeEnum.Term,
      field,
      size: this.defaultValueService.getDefaultConfig().aggregationTermSize.toString()
    };
    if (prefix) {
      aggregation.include = prefix + '.*';
    }
    const aggreationRequest: AggregationsRequest = {
      aggregations: [aggregation],
      filter
    };

    return this.collabSearchService.getExploreApi().aggregatePost(collection, aggreationRequest, false, 120,
      this.collabSearchService.getFetchOptions()).then((a: AggregationResponse) => a.elements ? a.elements.map(e => e.key) : [])
      .finally(() => {
        if (showSpinner) {
          this.spinner.hide();
        }
      });
  }

  public getTermAggregationStartWith(collection: string, field: string, startWith: string) {
    return this.getTermAggregation(
      collection,
      field,
      false,
      {
        q: [[
          field + ':' + startWith + '*'
        ]]
      });
  }

  public getCollectionInterval(collection): string {
    let dateFormat = 'M/D/YYYY';
    if (this.translate.currentLang === 'fr') {
      dateFormat = 'DD/MM/YYYY';
    }
    if (this.collectionMinIntervalMap.has(collection) && this.collectionMaxIntervalMap.has(collection)) {
      const minDate = moment(this.collectionMinIntervalMap.get(collection)).format(dateFormat);
      const maxDate = moment(this.collectionMaxIntervalMap.get(collection)).format(dateFormat);
      return minDate + ' - ' + maxDate;
    } else {
      return '';
    }

  }

  public computeBbox(collection): Observable<any> {
    this.spinner.show();
    return from(this.collabSearchService.getExploreApi().compute(
      collection, this.collectionParamsMap.get(collection).params.centroid_path,
      ComputationRequest.MetricEnum.GEOBBOX.toString(), null, null, null, null, null, null, this.collabSearchService.getFetchOptions()
    ).finally(() => this.spinner.hide()));
  }

  public buildGroupCollectionItems(items: CollectionItem[], currentOrg: string): GroupCollectionItem {
    const groupCollection = items.reduce((acc, item) => {
      if (!!currentOrg && currentOrg.length > 0) {
        if (item.isPublic && item.owner !== currentOrg) {
          acc.public.push(item);
        } else {
          if (item.sharedWith.includes(currentOrg) && item.owner !== currentOrg) {
            acc.shared.push(item);
          } else {
            if (item.owner === currentOrg) {
              acc.owner.push(item);
            }
          }
        }
      } else {
        acc.collections.push(item);
      }
      return acc;
    }, { owner: [], shared: [], public: [], collections: [] });
    return groupCollection;
  }
}


