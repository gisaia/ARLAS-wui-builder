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
import { Component, OnInit } from '@angular/core';
import { FormArray } from '@angular/forms';
import {
  CollectionUnitFormGroup,
  LookAndFeelGlobalFormGroup
} from '@look-and-feel-config/services/look-and-feel-global-form-builder/look-and-feel-global-form-builder.service';
import { CollectionService } from '@services/collection-service/collection.service';
import { MainFormService } from '@services/main-form/main-form.service';

@Component({
    selector: 'arlas-global-look-and-feel',
    templateUrl: './global-look-and-feel.component.html',
    styleUrls: ['./global-look-and-feel.component.scss'],
    standalone: false
})
export class GlobalLookAndFeelComponent implements OnInit {

  public lookAndFeelFg: LookAndFeelGlobalFormGroup;
  public unitsFg: FormArray;

  public constructor(
    private readonly mainFormService: MainFormService,
    private readonly collectionService: CollectionService
  ) {
    this.lookAndFeelFg = this.mainFormService.lookAndFeelConfig.getGlobalFg();
  }

  public ngOnInit() {
    const configuredCollections = this.mainFormService.getAllCollections(this.collectionService);

    /** keeping formarray order */
    const formArrayCollections = (this.lookAndFeelFg.customControls.units.value as FormArray).controls.map(control =>
      (control as CollectionUnitFormGroup).customControls.collection.value
    );
    const collectionsSet = new Set(configuredCollections);
    const formSetCollections = new Set(formArrayCollections);
    const orderedCollections = [];
    formArrayCollections.forEach(fc => {
      if (collectionsSet.has(fc)) {
        orderedCollections.push(fc);
      }
    });
    /** add newly configured collections at the end */
    configuredCollections.forEach(c => {
      if (!formSetCollections.has(c)) {
        orderedCollections.push(c);
      }
    });
    this.unitsFg = this.lookAndFeelFg.buildUnits(orderedCollections);
    this.lookAndFeelFg.customControls.units.setValue(this.unitsFg);
  }

}
