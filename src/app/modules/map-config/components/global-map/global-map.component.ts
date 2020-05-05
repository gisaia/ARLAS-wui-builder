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
import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { CollectionService, FIELD_TYPES } from '@services/collection-service/collection.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { Expression } from 'arlas-api';
import { GlobalMapComponentForm as GlobalMapComponentForm } from './global-map.component.form';
import { MapInitService } from '@map-config/services/map-init/map-init.service';

@Component({
  selector: 'app-global',
  templateUrl: './global-map.component.html',
  styleUrls: ['./global-map.component.scss']
})
export class GlobalMapComponent extends GlobalMapComponentForm implements OnInit {

  public operators = [
    Expression.OpEnum.Intersects,
    Expression.OpEnum.Notintersects,
    Expression.OpEnum.Notwithin,
    Expression.OpEnum.Within
  ];
  public collections: string[];
  public geoFieldsByCollection: Map<string, string[]> = new Map<string, string[]>();
  public keywordFieldsByCollection: Map<string, string[]> = new Map<string, string[]>();
  public formArrayGeom: FormArray = new FormArray([]);

  constructor(
    public mainFormService: MainFormService,
    private mapInitService: MapInitService,
    private collectionService: CollectionService) {

    super(mainFormService);
  }

  public ngOnInit() {
    this.collections = this.mainFormService.getCollections();
    this.collections.forEach((collection) => {

      this.collectionService.getCollectionFieldsNames(collection, [FIELD_TYPES.GEOPOINT, FIELD_TYPES.GEOSHAPE]).subscribe(fields => {
        this.geoFieldsByCollection.set(collection, fields);
      });
      this.collectionService.getCollectionFieldsNames(collection, [FIELD_TYPES.KEYWORD]).subscribe(fields => {
        this.keywordFieldsByCollection.set(collection, fields);
      });

      // Push a new FormGroup iff the FormArray (requestGeometries) doesn't contains
      // as many controls that there is select collection
      if (this.requestGeometries.length < this.collections.length) {
        this.collectionService.getCollectionParamFields(collection).subscribe(params => {
          this.requestGeometries.push(
            this.mapInitService.createRequestGeometry(
              collection,
              params.geometry_path,
              params.id_path
            )
          );
        });
      }
    });
  }

  public getGeoFields(collection: string): string[] {
    return this.geoFieldsByCollection.get(collection);
  }

  public getKeywordFields(collection: string): string[] {
    return this.keywordFieldsByCollection.get(collection);
  }
}
