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
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, forwardRef, OnInit, ViewChild, Input, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import {
  FormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR, FormControl
} from '@angular/forms';
import { MatSliderChange } from '@angular/material/slider';
import { MatStepper } from '@angular/material/stepper';
import { CollectionService, FIELD_TYPES } from '@services/collection-service/collection.service';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { NGXLogger } from 'ngx-logger';
import { EditLayerModeFormComponentForm } from './edit-layer-mode-form.component.form';
import { GEOMETRY_TYPE } from './models';
import { PROPERTY_SELECTOR_SOURCE, PROPERTY_TYPE } from '@shared-components/property-selector/models';
import { ensureMinLessThanMax } from '@utils/tools';
import { PropertySelectorComponent } from '@shared-components/property-selector/property-selector.component';

@Component({
  selector: 'app-edit-layer-mode-form',
  templateUrl: './edit-layer-mode-form.component.html',
  styleUrls: ['./edit-layer-mode-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditLayerModeFormComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => EditLayerModeFormComponent),
      multi: true
    },
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true }
    }
  ]
})
// ControlValueAccessor: see https://christianlydemann.com/form-validation-with-controlvalueaccessor/
export class EditLayerModeFormComponent extends EditLayerModeFormComponentForm implements OnInit, AfterViewInit {

  @ViewChild('stepper', { static: false }) stepper: MatStepper;
  @Input() aggregatedMode = false;
  @Input() colorFgSources: Array<string>;
  @ViewChildren(PropertySelectorComponent) propertySelectorComponents: QueryList<PropertySelectorComponent>;

  public ensureMinLessThanMax = ensureMinLessThanMax;

  public GEOMETRY_TYPE = GEOMETRY_TYPE;
  public PROPERTY_TYPE = PROPERTY_TYPE;
  public widthFgSources = [PROPERTY_SELECTOR_SOURCE.fix, PROPERTY_SELECTOR_SOURCE.interpolated];
  public radiusFgSources = [PROPERTY_SELECTOR_SOURCE.fix, PROPERTY_SELECTOR_SOURCE.interpolated];
  public collectionGeoPointFields: string[] = [];
  public collectionGeoFields: string[] = [];
  public collectionKeywordFields: string[] = [];
  public collectionIntegerFields: string[] = [];

  constructor(
    protected formBuilderDefault: FormBuilderWithDefaultService,
    protected formBuilder: FormBuilder,
    protected logger: NGXLogger,
    public mainformService: MainFormService,
    public collectionService: CollectionService
  ) {
    super(formBuilderDefault, formBuilder, logger);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngAfterViewInit() {
    this.initCollectionRelatedFields();
  }

  protected onSubmit() {

    super.onSubmit();

    // activate stepper validation on submit
    this.stepper.steps.setDirty();
    this.stepper.steps.forEach(s => s.interacted = true);
  }

  private initCollectionRelatedFields() {
    this.collectionCtrl.valueChanges.subscribe(c => {
      if (!c) {
        return;
      }
      this.collectionService.getCollectionFields(c, [FIELD_TYPES.GEOPOINT])
      .subscribe(
        f => {
          this.collectionGeoPointFields = f;
        });
      this.collectionService.getCollectionFields(c, [FIELD_TYPES.GEOPOINT, FIELD_TYPES.GEOSHAPE])
        .subscribe(
          f => {
            this.collectionGeoFields = f;
          });
      this.collectionService.getCollectionFields(c, [FIELD_TYPES.KEYWORD])
        .subscribe(
          f => {
            this.collectionKeywordFields = f;
            this.propertySelectorComponents.forEach(psc => psc.collectionKeywordFieldsEmitter.emit(f));
          });
      this.collectionService.getCollectionFields(c, [FIELD_TYPES.LONG, FIELD_TYPES.INTEGER, FIELD_TYPES.DATE])
        .subscribe(
          f => {
            this.collectionIntegerFields = f;
            this.propertySelectorComponents.forEach(psc => psc.collectionIntegerFieldsEmitter.emit(f));
          });
    });
    if (!!this.collectionCtrl.value) {
      // init values in edition mode
      this.collectionCtrl.updateValueAndValidity({ onlySelf: true, emitEvent: true });
    }
  }

  writeValue(obj: any): void {
    super.writeValue(obj);
    if (obj) {
      this.collectionCtrl.updateValueAndValidity({ onlySelf: true, emitEvent: true });
    }
  }


}
