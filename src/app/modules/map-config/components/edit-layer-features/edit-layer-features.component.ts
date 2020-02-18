import { Component, OnInit, Input, forwardRef, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import {
  FormBuilder, FormGroup, Validators, AbstractControl, NG_VALUE_ACCESSOR, NG_VALIDATORS,
  ControlValueAccessor, Validator, ValidationErrors
} from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Observable, Subscription } from 'rxjs';
import { MatStepper } from '@angular/material';

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

  public modeFormGroup: FormGroup = this.formBuilder.group({
    collectionStep: this.formBuilder.group({
      collectionCtrl: ['', Validators.required]
    }),
    geometryStep: this.formBuilder.group({
      geometryCtrl: ['', Validators.required]
    })
  });

  constructor(
    private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.submitSubscription = this.submit.subscribe(() => {
      // force the display validation errors
      this.stepper.steps.setDirty();
      this.stepper.steps.forEach(s => s.interacted = true);
      this.modeFormGroup.markAllAsTouched();
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
}
