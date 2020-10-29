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
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { map, finalize } from 'rxjs/operators';
import {
  CollectionReferenceDescriptionProperty, Filter, CollectionReferenceDescription,
  ComputationRequest, Aggregation, AggregationsRequest, AggregationResponse
} from 'arlas-api';
import { NgxSpinnerService } from 'ngx-spinner';
import { NGXLogger } from 'ngx-logger';
import { DefaultValuesService } from '@services/default-values/default-values.service';
export import FIELD_TYPES = CollectionReferenceDescriptionProperty.TypeEnum;
export import METRIC_TYPES = ComputationRequest.MetricEnum;
import { CollectionField } from './models';
import { projType } from 'arlas-web-core';
import { Hits } from 'arlas-api';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {

  private collectionsDescriptions = new Map<string, Observable<CollectionReferenceDescription>>();
  public taggableFields = new Set<string>();

  constructor(
    private collabSearchService: ArlasCollaborativesearchService,
    private spinner: NgxSpinnerService,
    private defaultValueService: DefaultValuesService,
    private logger: NGXLogger
  ) { }

  public getDescribe(collection: string): Observable<CollectionReferenceDescription> {
    const describtionObs = this.collectionsDescriptions.get(collection);
    if (!describtionObs) {
      const describe = this.collabSearchService.describe(collection);
      this.collectionsDescriptions.set(collection, describe);
      return describe;
    } else {
      return describtionObs;
    }
  }

  public getCollectionFields(collection: string, types?: Array<FIELD_TYPES>, exclude: boolean = false)
    : Observable<Array<CollectionField>> {

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
                  this.taggableFields.add(path);
                }
                return { name: path, type: property.type, indexed: property.indexed };
              } else if (exclude && (!types || !types.includes(property.type))) {
                if (property && property.taggable) {
                  this.taggableFields.add(path);
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
      this.collabSearchService.getFetchOptions()).then(ag => {
      this.spinner.hide();
      return ag.value;
    })
      .finally(() => this.spinner.hide());
  }

  public countNbDocuments(): Observable<Hits> {
    return this.collabSearchService.resolveButNotHits([projType.count, {}],
      this.collabSearchService.collaborations, null, null, false, 120);
  }

  public getTermAggregation(collection: string, field: string, showSpinner: boolean = true, filter?: Filter): Promise<Array<string>> {

    if (showSpinner) {
      this.spinner.show();
    }
    const aggregation: Aggregation = {
      type: Aggregation.TypeEnum.Term,
      field,
      size: this.defaultValueService.getDefaultConfig().aggregationTermSize.toString()
    };
    const aggreationRequest: AggregationsRequest = {
      aggregations: [aggregation],
      filter
    };

    return this.collabSearchService.getExploreApi().aggregatePost(collection, aggreationRequest, false, 120,
      this.collabSearchService.getFetchOptions()).then((a: AggregationResponse) => {
      return a.elements ? a.elements.map(e => e.key) : [];
    })
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

}
