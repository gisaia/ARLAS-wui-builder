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
import { Component, OnInit, OnDestroy } from '@angular/core';
import { GlobalTimelineComponentForm } from './global-timeline.component.form';
import { CollectionService, FIELD_TYPES } from '@services/collection-service/collection.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';

@Component({
  selector: 'app-global-timeline',
  templateUrl: './global-timeline.component.html',
  styleUrls: ['./global-timeline.component.scss'],
})
export class GlobalTimelineComponent extends GlobalTimelineComponentForm implements OnInit, OnDestroy {

  public dateFields: Array<string>;
  public submitSubject = new BehaviorSubject<boolean>(false);
  private touchedSubscription: Subscription;

  constructor(
    protected mainFormService: MainFormService,
    protected formBuilderDefault: FormBuilderWithDefaultService,
    private collectionService: CollectionService
  ) {
    super(mainFormService, formBuilderDefault);
  }

  public ngOnInit() {
    // TODO use multi collection instead of the first one
    this.collectionService.getCollectionFields(this.mainFormService.getCollections()[0], [FIELD_TYPES.DATE])
      .subscribe(fields => this.dateFields = fields);

    this.markSubFormsTouched();
    this.enableDisableDetailedTimeline();
  }

  // on submission of the parent form, propagate to the sub forms
  private markSubFormsTouched() {
    this.touchedSubscription = this.globalFg.statusChanges.subscribe(st => {
      if (this.globalFg.touched) {
        this.submitSubject.next(true);
        this.touchedSubscription.unsubscribe();
      }
    });
    // trigger event on edition
    this.globalFg.updateValueAndValidity();
  }

  public ngOnDestroy() {
    this.touchedSubscription.unsubscribe();
  }

  private enableDisableDetailedTimeline() {
    this.useDetailedTimeline.valueChanges.subscribe(
      v => v ? this.detailedTimeline.enable() : this.detailedTimeline.disable());
    this.useDetailedTimeline.updateValueAndValidity({ onlySelf: true, emitEvent: true });
  }

}
