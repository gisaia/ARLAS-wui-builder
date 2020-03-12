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
import { Component, OnInit, Input, forwardRef, OnDestroy, ViewChild } from '@angular/core';
import {
  FormBuilder, AbstractControl, NG_VALUE_ACCESSOR, NG_VALIDATORS,
  ControlValueAccessor, Validator, ValidationErrors, FormArray
} from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Observable, Subscription } from 'rxjs';
import { MatStepper, MatDialog, MatSliderChange } from '@angular/material';
import { NGXLogger } from 'ngx-logger';
import { MainFormService } from '@services/main-form/main-form.service';
import { CollectionService, FIELD_TYPES, METRIC_TYPES } from '@services/collection-service/collection.service';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { DialogColorTableComponent, DialogColorTableData } from '../dialog-color-table/dialog-color-table.component';
import { DialogPaletteSelectorComponent } from '../dialog-palette-selector/dialog-palette-selector.component';
import { DialogPaletteSelectorData } from '../dialog-palette-selector/model';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import { EditLayerFeaturesComponentForm } from './edit-layer-features.component.form';
import { KeywordColor, COLOR_SOURCE, GEOMETRY_TYPE } from './models';
import { updateValueAndValidity } from '@utils/tools';

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
export class EditLayerFeaturesComponent extends EditLayerFeaturesComponentForm
  implements OnInit, ControlValueAccessor, Validator, OnDestroy {

  @ViewChild('stepper', { static: false }) stepper: MatStepper;
  @Input() submit: Observable<void>;
  private submitSubscription: Subscription;
  public COLOR_SOURCE = COLOR_SOURCE;
  public GEOMETRY_TYPE = GEOMETRY_TYPE;
  public collectionGeoFields: string[] = [];
  public collectionKeywordFields: string[] = [];
  public collectionIntegerFields: string[] = [];

  constructor(
    protected formBuilderDefault: FormBuilderWithDefaultService,
    protected formBuilder: FormBuilder,
    private logger: NGXLogger,
    public dialog: MatDialog,
    public mainformService: MainFormService,
    public collectionService: CollectionService,
    private colorService: ArlasColorGeneratorLoader,
    private defaultValueService: DefaultValuesService
  ) {
    super(formBuilderDefault, formBuilder);
  }

  ngOnInit() {

    this.initActivateValidationOnSubmit();
    this.initForceUpdateChoosenColorValidityOnChange();
    this.initCollectionRelatedFields();
    this.initUpdateManualColorKeywordOnSourceFieldChange();
    this.initUpdateMinMaxOnInterpolatedFieldChange();
  }

  private initActivateValidationOnSubmit() {
    this.submitSubscription = this.submit.subscribe(() => {
      // activate validation on submit
      this.logger.log('submitting', this.featuresFg);
      this.stepper.steps.setDirty();
      this.stepper.steps.forEach(s => s.interacted = true);
      this.featuresFg.markAllAsTouched();
    });
  }

  private initForceUpdateChoosenColorValidityOnChange() {
    [this.colorSourceCtrl, this.colorInterpolatedFieldCtrl, this.colorInterpolatedNormalizeCtrl,
    this.colorInterpolatedScopeCtrl, this.colorInterpolatedNormalizeCtrl]
      .forEach(ctrl =>
        ctrl.valueChanges.subscribe(value => {
          updateValueAndValidity(this.colorFg, true, false);
        })
      );
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

  private initUpdateManualColorKeywordOnSourceFieldChange() {
    this.colorManualFieldCtrl.valueChanges.subscribe(v => {
      this.colorManualValuesCtrl.clear();

      if (v) {
        this.collectionService.getTermAggregation(this.collectionCtrl.value, v).then((keywords: Array<string>) => {
          keywords.forEach((k: string) => {
            this.addToColorManualValuesCtrl({
              keyword: k,
              color: this.colorService.getColor(k)
            });
          });
          this.addToColorManualValuesCtrl({
            keyword: 'OTHER',
            color: this.defaultValueService.getDefaultConfig().otherColor
          });
        });
      }
    });
  }

  private initUpdateMinMaxOnInterpolatedFieldChange() {
    this.colorInterpolatedFieldCtrl.valueChanges.subscribe(f => {
      if (!f) {
        return;
      }
      this.collectionService.getComputationMetric(this.collectionCtrl.value, f, METRIC_TYPES.MIN).then(min =>
        this.colorInterpolatedMinValueCtrl.setValue(min)
      );
      this.collectionService.getComputationMetric(this.collectionCtrl.value, f, METRIC_TYPES.MAX).then(max =>
        this.colorInterpolatedMaxValueCtrl.setValue(max)
      );
    });
  }



  public onTouched: () => void = () => { };

  writeValue(obj: any): void {
    if (obj) {
      this.featuresFg.patchValue(obj, { emitEvent: false });
      this.onTouched();
      // launch 'onChange' event on fields that are necesaary to other fields, for edition mode
      this.collectionCtrl.updateValueAndValidity({ onlySelf: true, emitEvent: true });
      this.colorInterpolatedFieldCtrl.updateValueAndValidity({ onlySelf: true, emitEvent: true });

      // with FormArray, values cannot be simply set, each inner element is a FormGroup to be created
      obj.styleStep.colorFg.colorManualFg.colorManualValuesCtrl.forEach((k: KeywordColor) => {
        this.addToColorManualValuesCtrl(k);
      });
    }
  }
  registerOnChange(fn: any): void {
    this.featuresFg.valueChanges.subscribe(fn);
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.featuresFg.disable() : this.featuresFg.enable();
  }
  validate(control: AbstractControl): ValidationErrors {
    return this.featuresFg.valid ? null : { invalidForm: { valid: false, message: 'Features fields are invalid' } };
  }
  registerOnValidatorChange?(fn: () => void): void {
    this.featuresFg.valueChanges.subscribe(fn);
  }

  ngOnDestroy() {
    this.submitSubscription.unsubscribe();
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

  public openColorTable() {
    const dialogRef = this.dialog.open(DialogColorTableComponent, {
      data: {
        collection: this.collectionCtrl.value,
        sourceField: this.colorManualFieldCtrl.value,
        keywordColors: this.colorManualValuesCtrl.value
      } as DialogColorTableData,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result: Array<KeywordColor>) => {
      if (result !== undefined) {
        this.colorManualValuesCtrl.clear();
        result.forEach((k: KeywordColor) => {
          this.addToColorManualValuesCtrl(k);
        });
      }
    });
  }

  public openPaletteTable() {
    const paletteData: DialogPaletteSelectorData = {
      min: this.colorInterpolatedNormalizeCtrl.value ? 0 : this.colorInterpolatedMinValueCtrl.value,
      max: this.colorInterpolatedNormalizeCtrl.value ? 1 : this.colorInterpolatedMaxValueCtrl.value,
      defaultPalettes: this.defaultValueService.getDefaultConfig().palettes,
      selectedPalette: this.colorInterpolatedPaletteCtrl.value
    };
    const dialogRef = this.dialog.open(DialogPaletteSelectorComponent, {
      data: paletteData,
      autoFocus: false,
      panelClass: 'dialog-with-overflow'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.colorInterpolatedFg.get('colorInterpolatedPaletteCtrl').setValue(result);
        this.colorInterpolatedFg.get('colorInterpolatedPaletteCtrl').markAsDirty();
      }
    });
  }

}
