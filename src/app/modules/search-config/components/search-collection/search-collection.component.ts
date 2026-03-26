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

import { Component, Input, OnInit } from '@angular/core';
import { FormArray } from '@angular/forms';
import { SearchCollectionFormGroup, SearchGlobalFormBuilderService }
  from '@search-config/services/search-global-form-builder/search-global-form-builder.service';

@Component({
    selector: 'arlas-search-collection',
    templateUrl: './search-collection.component.html',
    styleUrls: ['./search-collection.component.scss'],
    standalone: false
})
export class SearchCollectionComponent implements OnInit {

  @Input() public searchConfigurations: FormArray<SearchCollectionFormGroup>;

  public constructor(private searchGlobalFormBuilderService: SearchGlobalFormBuilderService) { }

  public ngOnInit(): void {

  }

  public addSearchConfiguration(): void {
    const searchConfiguration = this.searchGlobalFormBuilderService.buildSearchMainCollection();
    this.searchConfigurations.push(searchConfiguration);
  }

  public deleteSearchConfiguration(i: number): void {
    this.searchConfigurations.removeAt(i);
  }
}
