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
import { ComputationRequest, Aggregation, AggregationsRequest, AggregationResponse } from 'arlas-api';
import { NgxSpinnerService } from 'ngx-spinner';
import { NGXLogger } from 'ngx-logger';
import { CollectionReferenceDescriptionProperty, CollectionReferenceDescription, CollectionReferenceParameters } from 'arlas-api';

export import FIELD_TYPES = CollectionReferenceDescriptionProperty.TypeEnum;
export import METRIC_TYPES = ComputationRequest.MetricEnum;
import { DefaultValuesService } from '@services/default-values/default-values.service';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {

  constructor(
    private collabSearchService: ArlasCollaborativesearchService,
    private spinner: NgxSpinnerService,
    private defaultValueService: DefaultValuesService,
    private logger: NGXLogger
  ) { }

  public getCollectionFields(collection: string, types?: Array<FIELD_TYPES>)
    : Observable<Array<string>> {

    this.spinner.show();

    const result: Observable<Array<string>> = this.collabSearchService.describe(collection).pipe(map(
      (c: CollectionReferenceDescriptionProperty) => {

        const getSubFields = (properties, parentPath?: string): Array<string> => {
          return Object.keys(properties).flatMap(key => {
            const path = parentPath ? parentPath + '.' + key : key;
            const property = properties[key];

            if (property.type === CollectionReferenceDescriptionProperty.TypeEnum.OBJECT) {
              return getSubFields(property.properties, path);

            } else if (!types || types.includes(property.type)) {
              return path;
            } else {
              return null;
            }
          }).filter(p => p !== null);
        };

        return getSubFields(c.properties).sort();
      }))
      .pipe(finalize(() => this.spinner.hide()));

    return result;
  }

  public getComputationMetric(collection: string, field: string, metric: METRIC_TYPES) {

    const computation: ComputationRequest = {
      field,
      metric
    };
    this.spinner.show();

    return this.collabSearchService.getExploreApi().computePost(collection, computation).then(ag => {
      this.spinner.hide();
      return ag.value;
    })
      .finally(() => this.spinner.hide());
  }

  public getAggregation(collection: string, field: string): Promise<Array<string>> {

    this.spinner.show();
    const aggregation: Aggregation = {
      type: Aggregation.TypeEnum.Term,
      field,
      size: this.defaultValueService.getDefaultConfig().aggregationTermSize.toString()
    };
    const aggreationRequest: AggregationsRequest = {
      aggregations: [aggregation]
    };

    return this.collabSearchService.getExploreApi().aggregatePost(collection, aggreationRequest).then((a: AggregationResponse) => {
      return a.elements ? a.elements.map(e => e.key) : [];
    })
      .finally(() => this.spinner.hide());
  }
  
  public getCollectionParamFields(collection: string): Observable<CollectionReferenceParameters> {
    return this.collabSearchService.describe(collection).pipe(map((collectionDescription: CollectionReferenceDescription) => {
      return collectionDescription.params;
    }));

  }

}
