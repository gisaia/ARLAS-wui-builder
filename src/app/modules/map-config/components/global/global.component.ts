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
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { Expression } from 'arlas-api';
import { GlobalComponentForm } from './global.component.form';

@Component({
  selector: 'app-global',
  templateUrl: './global.component.html',
  styleUrls: ['./global.component.scss']
})
export class GlobalComponent extends GlobalComponentForm implements OnInit {

  public operators = [
    Expression.OpEnum.Intersects,
    Expression.OpEnum.Notintersects,
    Expression.OpEnum.Notwithin,
    Expression.OpEnum.Within
  ];
  public collections: string[];
  public geoFieldsByCollection: Map<string, string[]> = new Map<string, string[]>();
  public formArrayGeom: FormArray = new FormArray([]);

  constructor(
    protected mainFormService: MainFormService,
    protected formBuilderDefault: FormBuilderWithDefaultService,
    private collectionService: CollectionService) {

    super(mainFormService, formBuilderDefault);
  }

  ngOnInit() {
    this.collections = this.mainFormService.getCollections();
    this.collections.forEach((collection) => {

      this.collectionService.getCollectionFields(collection, [FIELD_TYPES.GEOPOINT, FIELD_TYPES.GEOSHAPE]).subscribe(fields => {
        this.geoFieldsByCollection.set(collection, fields);
      });
      // Push a new FormGroup iff the FormArray (requestGeometries) doesn't contains
      // as many controls that there is select collection
      if (this.requestGeometries.length < this.collections.length) {
        this.collectionService.getCollectionParamFields(collection).subscribe(params => {
          this.requestGeometries.push(new FormGroup({
            collection: new FormControl({ value: collection, disabled: true }),
            requestGeom: new FormControl(params.geometry_path, Validators.required)
          }));
        });
      }
    });
  }

  public getGeoFields(collection: string): string[] {
    return this.geoFieldsByCollection.get(collection);
  }
}
