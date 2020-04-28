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
import { MainFormService } from '@services/main-form/main-form.service';
import { CollectionService, FIELD_TYPES } from '@services/collection-service/collection.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-global-search',
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.scss']
})
export class GlobalSearchComponent implements OnInit {

  public keywordFields: Array<string>;
  public globalFg: FormGroup;

  constructor(
    private collectionService: CollectionService,
    private mainFormService: MainFormService
  ) {

    this.globalFg = this.mainFormService.searchConfig.getGlobalFg();
  }

  public ngOnInit() {
    // TODO use multi collection instead of the first one
    this.collectionService.getCollectionFieldsNames(this.mainFormService.getCollections()[0], [FIELD_TYPES.KEYWORD])
      .subscribe(fields => this.keywordFields = fields);
  }

}
