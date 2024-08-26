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
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { CollectionService } from '@services/collection-service/collection.service';
import { toKeywordOptionsObs } from '@services/collection-service/tools';
import { FieldTemplateControl } from '@shared-models/config-form';
import { CollectionReferenceDescriptionProperty } from 'arlas-api';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'arlas-resultlist-data',
  templateUrl: './resultlist-data.component.html',
  styleUrls: ['./resultlist-data.component.scss']
})
export class ResultlistDataComponent implements OnInit, OnDestroy {

  @Input() public control: FormGroup;
  public detailsTitleControl: FieldTemplateControl;

  private onDestroy$ = new Subject<boolean>();

  public constructor(
    private collectionService: CollectionService
  ) { }

  public ngOnDestroy() {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

  public ngOnInit() {
    const collectionControl = this.control.get('collection');
    this.detailsTitleControl = new FieldTemplateControl(
      '',
      marker('Details title'),
      marker('Details title description'),
      this.collectionService.getCollectionFields(
        collectionControl?.value,
        [CollectionReferenceDescriptionProperty.TypeEnum.KEYWORD]
      ),
      false,
      {
        optional: true
      }
    );

    if (!!this.control.get('detailsTitle') && !!this.control.get('detailsTitle').value) {
      this.detailsTitleControl.setValue(this.control.get('detailsTitle').value);
    }

    this.detailsTitleControl.valueChanges.pipe(takeUntil(this.onDestroy$)).subscribe({
      next: (value) => {
        this.control.get('detailsTitle').setValue(value);
      }
    });

    if (!!collectionControl) {
      collectionControl.valueChanges.pipe(takeUntil(this.onDestroy$)).subscribe(c => {
        toKeywordOptionsObs(this.collectionService
          .getCollectionFields(c))
          .subscribe(collectionFs => {
            this.detailsTitleControl.setValue('');
            this.detailsTitleControl.fields = collectionFs;
            this.detailsTitleControl.filterAutocomplete();
          });
      });
    }
  }
}
