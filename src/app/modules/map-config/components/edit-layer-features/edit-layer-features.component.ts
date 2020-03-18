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
import { Component, forwardRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR, FormControl
} from '@angular/forms';
import { MatSliderChange } from '@angular/material/slider';
import { MatStepper } from '@angular/material/stepper';
import { CollectionService, FIELD_TYPES } from '@services/collection-service/collection.service';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { NGXLogger } from 'ngx-logger';
import { EditLayerFeaturesComponentForm } from './edit-layer-features.component.form';
import { GEOMETRY_TYPE } from './models';
import { PROPERTY_SELECTOR_SOURCE, PROPERTY_TYPE } from '@shared-components/property-selector/models';
import { ensureMinLessThanMax } from '@utils/tools';

@Component({
  selector: 'app-edit-layer-features',
  templateUrl: './edit-layer-features.component.html',
  styleUrls: ['./edit-layer-features.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditLayerFeaturesComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => EditLayerFeaturesComponent),
      multi: true
    },
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true }
    }
  ]
})
// ControlValueAccessor: see https://christianlydemann.com/form-validation-with-controlvalueaccessor/
export class EditLayerFeaturesComponent extends EditLayerFeaturesComponentForm implements OnInit {

  @ViewChild('stepper', { static: false }) stepper: MatStepper;

  public ensureMinLessThanMax = ensureMinLessThanMax;

  public GEOMETRY_TYPE = GEOMETRY_TYPE;
  public PROPERTY_TYPE = PROPERTY_TYPE;
  public colorFgSources = Object.values(PROPERTY_SELECTOR_SOURCE);
  public widthFgSources = [PROPERTY_SELECTOR_SOURCE.fix, PROPERTY_SELECTOR_SOURCE.interpolated];
  public radiusFgSources = [PROPERTY_SELECTOR_SOURCE.fix, PROPERTY_SELECTOR_SOURCE.interpolated];
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
    this.initCollectionRelatedFields();
    this.initEnableWidthOrRadiusFg();
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
      this.collectionService.getCollectionFields(c, [FIELD_TYPES.GEOPOINT, FIELD_TYPES.GEOSHAPE])
        .subscribe(
          f => this.collectionGeoFields = f);
      this.collectionService.getCollectionFields(c, [FIELD_TYPES.KEYWORD])
        .subscribe(
          f => this.collectionKeywordFields = f);
      this.collectionService.getCollectionFields(c, [FIELD_TYPES.LONG, FIELD_TYPES.INTEGER, FIELD_TYPES.DATE])
        .subscribe(
          f => this.collectionIntegerFields = f);
    });
  }

  /**
   * widthFg and radiusFg are conditionally displayed, once they have been displayed, their subform has been
   * registred into the main form and their validation works even if they aren't displayed anymore.
   * The solution is to enable only the expected form group.
   */
  private initEnableWidthOrRadiusFg() {
    this.geometryTypeCtrl.valueChanges.subscribe(v => {
      const geoEnableDisable = [{
        geometry: GEOMETRY_TYPE.line,
        enabled: [this.widthFg],
        disabled: [this.radiusFg]
      },
      {
        geometry: GEOMETRY_TYPE.circle,
        enabled: [this.radiusFg],
        disabled: [this.widthFg]
      },
      {
        geometry: GEOMETRY_TYPE.fill,
        enabled: [this.radiusFg, this.widthFg],
        disabled: []
      }].find(elmt => elmt.geometry === v);

      geoEnableDisable.enabled.forEach(c => c.enable());
      geoEnableDisable.disabled.forEach(c => c.disable());
    });
    this.geometryTypeCtrl.updateValueAndValidity({ onlySelf: true, emitEvent: true });
  }

  writeValue(obj: any): void {
    super.writeValue(obj);
    if (obj) {
      this.collectionCtrl.updateValueAndValidity({ onlySelf: true, emitEvent: true });
    }
  }

  public checkZoom(event: MatSliderChange, source: string) {
    if (source === 'min') {
      if (event.value > this.zoomMaxCtrl.value) {
        this.zoomMaxCtrl.setValue(event.value);
      }
    } else if (source === 'max') {
      if (event.value < this.zoomMinCtrl.value) {
        this.zoomMinCtrl.setValue(event.value);
      }
    }
  }


}
