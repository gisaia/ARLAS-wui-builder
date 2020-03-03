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
  FormBuilder, FormGroup, Validators, AbstractControl, NG_VALUE_ACCESSOR, NG_VALIDATORS,
  ControlValueAccessor, Validator, ValidationErrors, FormArray
} from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Observable, Subscription } from 'rxjs';
import { MatStepper, MatDialog, MatSliderChange } from '@angular/material';
import { CustomValidators } from '@app/utils/custom-validators';
import { NGXLogger } from 'ngx-logger';
import { DialogColorTableComponent, KeywordColor } from '../dialog-color-table/dialog-color-table.component';
import { DialogPaletteSelectorComponent, PaletteData } from '../dialog-palette-selector/dialog-palette-selector.component';
import { MainFormService } from '@services/main-form/main-form.service';
import { FormBuilderWithDefaultService } from '@app/services/form-builder-with-default/form-builder-with-default.service';

enum COLOR_SOURCE {
  fix = 'fix',
  provided = 'provided',
  generated = 'generated',
  manual = 'manual',
  interpolated = 'interpolated'
}

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
export class EditLayerFeaturesComponent implements OnInit, ControlValueAccessor, Validator, OnDestroy {

  @ViewChild('stepper', { static: false }) stepper: MatStepper;
  @Input() submit: Observable<void>;
  private submitSubscription: Subscription;
  public COLOR_SOURCE = COLOR_SOURCE;

  public modeFormGroup: FormGroup;
  constructor(
    private formBuilderDefault: FormBuilderWithDefaultService,
    private formBuilder: FormBuilder,
    private logger: NGXLogger,
    public dialog: MatDialog,
    public mainformService: MainFormService
  ) { }

  ngOnInit() {

    this.modeFormGroup = this.formBuilderDefault.group('map.layer', {
      collectionStep: this.formBuilder.group({
        collectionCtrl:
          [
            null,
            Validators.required
          ]
      }),
      geometryStep: this.formBuilder.group({
        geometryCtrl:
          [
            null,
            Validators.required
          ],
        geometryTypeCtrl:
          [
            null,
            Validators.required
          ]
      }),
      visibilityStep: this.formBuilder.group({
        visibleCtrl:
          [
            null
          ],
        zoomMinCtrl:
          [
            null,
            [
              Validators.required, Validators.min(1), Validators.max(20)
            ]
          ],
        zoomMaxCtrl:
          [
            null,
            [
              Validators.required, Validators.min(1), Validators.max(20)
            ]
          ],
        featuresMaxCtrl:
          [
            null,
            [
              Validators.required,
              Validators.max(10000),
              Validators.min(0)
            ]
          ]
      },
        {
          validator:
            [
              CustomValidators.getLTEValidator('zoomMinCtrl', 'zoomMaxCtrl')
            ]
        }),
      styleStep: this.formBuilder.group({
        opacityCtrl:
          [
            null
          ],
        colorSourceCtrl:
          [
            null,
            Validators.required
          ],
        choosenColorGrp: this.formBuilder.group({
          colorFixCtrl:
            [
              null,
              CustomValidators.getConditionalValidator(() => !!this.modeFormGroup ?
                this.colorSourceCtrl().value === COLOR_SOURCE.fix :
                false,
                Validators.required)
            ],
          colorProvidedFieldCtrl:
            [
              null,
              CustomValidators.getConditionalValidator(() => !!this.modeFormGroup ?
                this.colorSourceCtrl().value === COLOR_SOURCE.provided :
                false,
                Validators.required)
            ],
          colorGeneratedFieldCtrl:
            [
              null,
              CustomValidators.getConditionalValidator(() => !!this.modeFormGroup ?
                this.colorSourceCtrl().value === COLOR_SOURCE.generated
                : false,
                Validators.required)
            ],
          colorManualGroup: this.formBuilder.group({
            colorManualFieldCtrl:
              [
                null,
                CustomValidators.getConditionalValidator(() => !!this.modeFormGroup ?
                  this.colorSourceCtrl().value === COLOR_SOURCE.manual :
                  false,
                  Validators.required)
              ],
            colorManualValuesCtrl: this.formBuilder.array(
              [],
              [
                CustomValidators.getConditionalValidator(() => !!this.modeFormGroup ?
                  this.colorSourceCtrl().value === COLOR_SOURCE.manual :
                  false,
                  Validators.required)
              ])
          }),
          colorInterpolatedGroup: this.formBuilder.group({
            colorInterpolatedFieldCtrl:
              [
                null,
                CustomValidators.getConditionalValidator(() => !!this.modeFormGroup ?
                  this.colorSourceCtrl().value === COLOR_SOURCE.interpolated :
                  false,
                  Validators.required)
              ],
            colorInterpolatedNormalizeCtrl:
              [
                null,
                CustomValidators.getConditionalValidator(() => !!this.modeFormGroup ?
                  this.colorSourceCtrl().value === COLOR_SOURCE.interpolated && this.colorInterpolatedFieldCtrl().value
                  : false,
                  Validators.required)
              ],
            colorInterpolatedScopeCtrl:
              [
                null,
                CustomValidators.getConditionalValidator(() => !!this.modeFormGroup ?
                  this.colorSourceCtrl().value === COLOR_SOURCE.interpolated && this.colorInterpolatedNormalizeCtrl().value
                  : false,
                  Validators.required)
              ],
            colorInterpolatedNormalizeByKeyCtrl:
              [
                null
              ],
            colorInterpolatedNormalizeLocalFieldCtrl:
              [
                null,
                CustomValidators.getConditionalValidator(() => !!this.modeFormGroup ?
                  this.colorSourceCtrl().value === COLOR_SOURCE.interpolated && this.colorInterpolatedNormalizeByKeyCtrl().value :
                  false,
                  Validators.required)
              ],
            colorInterpolatedMinValueCtrl:
              [
                null,
                CustomValidators.getConditionalValidator(() => !!this.modeFormGroup ?
                  this.colorSourceCtrl().value === COLOR_SOURCE.interpolated && this.colorInterpolatedFieldCtrl().value
                  && !this.colorInterpolatedNormalizeCtrl().value :
                  false,
                  Validators.required)
              ],
            colorInterpolatedMaxValueCtrl:
              [
                null,
                CustomValidators.getConditionalValidator(() => !!this.modeFormGroup ?
                  this.colorSourceCtrl().value === COLOR_SOURCE.interpolated && this.colorInterpolatedFieldCtrl().value
                  && !this.colorInterpolatedNormalizeCtrl().value :
                  false,
                  Validators.required)
              ],
            colorInterpolatedPaletteCtrl:
              [
                null,
                CustomValidators.getConditionalValidator(() => !!this.modeFormGroup ?
                  this.colorSourceCtrl().value === COLOR_SOURCE.interpolated && this.colorInterpolatedFieldCtrl().value :
                  false,
                  Validators.required)
              ]
          })
        })
      })
    });

    this.submitSubscription = this.submit.subscribe(() => {
      // activate validation on submit
      this.logger.log('submitting', this.modeFormGroup);
      this.stepper.steps.setDirty();
      this.stepper.steps.forEach(s => s.interacted = true);
      this.modeFormGroup.markAllAsTouched();
    });

    // force to update the validators of choosenColor controls
    [this.colorSourceCtrl(), this.colorInterpolatedFieldCtrl(), this.colorInterpolatedNormalizeCtrl(),
    this.colorInterpolatedScopeCtrl(), this.colorInterpolatedNormalizeCtrl()]
      .forEach(ctrl =>
        ctrl.valueChanges.subscribe(value => {
          this.updateValueAndValidity(this.choosenColorGrp());
        })
      );

    // in manual color mode, update the keywords when source field is changed
    this.colorManualFieldCtrl().valueChanges.subscribe(v => {
      this.colorManualValuesCtrl().clear();
      const keywords = ['toto', 'tata'];
      keywords.forEach(k => {
        const keywordColorGrp = this.formBuilder.group({
          keyword: [''],
          color: ['']
        });
        keywordColorGrp.setValue({ keyword: k, color: '#ffffff' });
        this.colorManualValuesCtrl().push(keywordColorGrp);
      });
    });
  }

  // recursively update the value and validity of itself and sub-controls (but not ancestors)
  private updateValueAndValidity(control: AbstractControl) {
    control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    if (control instanceof FormGroup || control instanceof FormArray) {
      Object.keys(control.controls).forEach(key => {
        this.updateValueAndValidity(control.get(key));
      });
    }
  }

  public onTouched: () => void = () => { };

  writeValue(obj: any): void {
    if (obj) {
      this.modeFormGroup.patchValue(obj, { emitEvent: false });
      this.onTouched();
    }
  }
  registerOnChange(fn: any): void {
    this.modeFormGroup.valueChanges.subscribe(fn);
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.modeFormGroup.disable() : this.modeFormGroup.enable();
  }
  validate(control: AbstractControl): ValidationErrors {
    return this.modeFormGroup.valid ? null : { invalidForm: { valid: false, message: 'Features fields are invalid' } };
  }
  registerOnValidatorChange?(fn: () => void): void {
    this.modeFormGroup.valueChanges.subscribe(fn);
  }

  ngOnDestroy() {
    this.submitSubscription.unsubscribe();
  }

  public checkZoom(event: MatSliderChange, source: string) {
    if (source === 'min') {
      if (event.value > this.zoomMaxCtrl().value) {
        this.zoomMaxCtrl().setValue(event.value);
      }
    } else if (source === 'max') {
      if (event.value < this.zoomMinCtrl().value) {
        this.zoomMinCtrl().setValue(event.value);
      }
    }

  }

  public zoomMinCtrl() {
    return this.modeFormGroup.get('visibilityStep').get('zoomMinCtrl');
  }

  public zoomMaxCtrl() {
    return this.modeFormGroup.get('visibilityStep').get('zoomMaxCtrl');
  }

  public colorSourceCtrl() {
    return this.modeFormGroup.get('styleStep').get('colorSourceCtrl');
  }

  public choosenColorGrp() {
    return this.modeFormGroup.get('styleStep').get('choosenColorGrp') as FormGroup;
  }

  public colorFixCtrl() {
    return this.choosenColorGrp().get('colorFixCtrl');
  }

  public setColorFix(color: string) {
    this.choosenColorGrp().get('colorFixCtrl').setValue(color);
    this.choosenColorGrp().get('colorFixCtrl').markAsDirty();
    this.choosenColorGrp().get('colorFixCtrl').markAsTouched();
  }

  public colorProvidedFieldCtrl() {
    return this.choosenColorGrp().get('colorProvidedFieldCtrl');
  }

  public colorGeneratedFieldCtrl() {
    return this.choosenColorGrp().get('colorGeneratedFieldCtrl');
  }

  public colorManualGroup() {
    return this.choosenColorGrp().get('colorManualGroup') as FormGroup;
  }

  public colorManualFieldCtrl() {
    return this.colorManualGroup().get('colorManualFieldCtrl');
  }

  public colorManualValuesCtrl() {
    return this.colorManualGroup().get('colorManualValuesCtrl') as FormArray;
  }

  public colorInterpolatedGroup() {
    return this.choosenColorGrp().get('colorInterpolatedGroup') as FormGroup;
  }

  public colorInterpolatedFieldCtrl() {
    return this.colorInterpolatedGroup().get('colorInterpolatedFieldCtrl');
  }

  public colorInterpolatedNormalizeCtrl() {
    return this.colorInterpolatedGroup().get('colorInterpolatedNormalizeCtrl');
  }

  public colorInterpolatedNormalizeByKeyCtrl() {
    return this.colorInterpolatedGroup().get('colorInterpolatedNormalizeByKeyCtrl');
  }

  public colorInterpolatedNormalizeLocalFieldCtrl() {
    return this.colorInterpolatedGroup().get('colorInterpolatedNormalizeLocalFieldCtrl');
  }

  public colorInterpolatedScopeCtrl() {
    return this.colorInterpolatedGroup().get('colorInterpolatedScopeCtrl');
  }

  public colorInterpolatedMinValueCtrl() {
    return this.colorInterpolatedGroup().get('colorInterpolatedMinValueCtrl');
  }

  public colorInterpolatedMaxValueCtrl() {
    return this.colorInterpolatedGroup().get('colorInterpolatedMaxValueCtrl');
  }

  public colorInterpolatedPaletteCtrl() {
    return this.colorInterpolatedGroup().get('colorInterpolatedPaletteCtrl');
  }

  public openColorTable() {
    const dialogRef = this.dialog.open(DialogColorTableComponent, {
      data: this.colorManualValuesCtrl().value as KeywordColor[],
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.colorManualValuesCtrl().setValue(result);
      }
    });
  }

  public openPaletteTable() {
    const paletteData: PaletteData = {
      defaultPalettes: [['#065143', '#ce1483'], ['#6d213c', '#946846', '#baab68'], ['#eecf6d', '#d5ac4e', '#8b6220', '#720e07', '#45050c']],
      selectedPalette: this.colorInterpolatedPaletteCtrl().value
    };
    const dialogRef = this.dialog.open(DialogPaletteSelectorComponent, {
      data: paletteData,
      autoFocus: false,
      panelClass: 'dialog-with-overflow'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.colorInterpolatedGroup().get('colorInterpolatedPaletteCtrl').setValue(result);
      }
    });
  }

}
