import { Component, OnInit, Input, forwardRef, Output, EventEmitter, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import {
  FormBuilder, FormGroup, Validators, AbstractControl, NG_VALUE_ACCESSOR, NG_VALIDATORS,
  ControlValueAccessor, Validator, ValidationErrors, ValidatorFn
} from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Observable, Subscription } from 'rxjs';
import { MatStepper } from '@angular/material';
import { CustomValidators } from '@app/utils/custom-validators';
import { NGXLogger } from 'ngx-logger';
import { DefaultValuesService } from '@services/default-values/default-values.service';

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

  public modeFormGroup: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private logger: NGXLogger, private defaultValuesService: DefaultValuesService) { }

  ngOnInit() {

    this.modeFormGroup = this.formBuilder.group({
      collectionStep: this.formBuilder.group({
        collectionCtrl: ['', Validators.required]
      }),
      geometryStep: this.formBuilder.group({
        geometryCtrl: ['', Validators.required],
        geometryTypeCtrl: ['', Validators.required]
      }),
      visibilityStep: this.formBuilder.group({
        visibleCtrl: [''],
        zoomMinCtrl: [this.defaultValuesService.getValue('map.layer.zoom.min'), Validators.required],
        zoomMaxCtrl: [this.defaultValuesService.getValue('map.layer.zoom.max'), Validators.required],
        featuresMaxCtrl: [this.defaultValuesService.getValue('map.layer.max_feature'), Validators.required]
      }, { validator: [CustomValidators.getLTEValidator('zoomMinCtrl', 'zoomMaxCtrl')] }),
      styleStep: this.formBuilder.group({
        opacityCtrl: [this.defaultValuesService.getValue('map.layer.opacity')],
        colorSourceCtrl: ['', Validators.required],
        choosenColorGrp: this.formBuilder.group({
          colorFixCtrl: ['', CustomValidators.getConditionalValidator(
            () => !!this.modeFormGroup ? this.colorSourceCtrl().value === 'fix' : false,
            Validators.required)],
          colorProvidedFieldCtrl: ['', CustomValidators.getConditionalValidator(
            () => !!this.modeFormGroup ? this.colorSourceCtrl().value === 'provided' : false,
            Validators.required)]
        })
      })
    });

    this.submitSubscription = this.submit.subscribe(() => {
      this.logger.log('submitting', this.modeFormGroup);
      this.stepper.steps.setDirty();
      this.stepper.steps.forEach(s => s.interacted = true);
      this.modeFormGroup.markAllAsTouched();
    });

    // force to update the validators of choosenColor controls
    this.colorSourceCtrl().valueChanges.subscribe(value => {
      Object.keys(this.choosenColorGrp().controls).forEach(k =>
        this.choosenColorGrp().get(k).updateValueAndValidity()
      );
    });
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
    return this.choosenColorGrp().get('colorFixCtrl').setValue(color);
  }
  public colorProvidedFieldCtrl() {
    return this.choosenColorGrp().get('colorProvidedFieldCtrl');
  }
}
