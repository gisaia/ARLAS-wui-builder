import { Component, OnInit, Input, forwardRef, OnDestroy, ViewChild } from '@angular/core';
import {
  FormBuilder, FormGroup, Validators, AbstractControl, NG_VALUE_ACCESSOR, NG_VALIDATORS,
  ControlValueAccessor, Validator, ValidationErrors, FormArray
} from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Observable, Subscription } from 'rxjs';
import { MatStepper, MatDialog } from '@angular/material';
import { CustomValidators } from '@app/utils/custom-validators';
import { NGXLogger } from 'ngx-logger';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { DialogColorTableComponent, KeywordColor } from '../dialog-color-table/dialog-color-table.component';

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
    private logger: NGXLogger,
    private defaultValuesService: DefaultValuesService,
    public dialog: MatDialog) { }

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
        zoomMinCtrl: [
          this.defaultValuesService.getValue('map.layer.zoom.min'),
          [
            Validators.required, Validators.min(1), Validators.max(20)
          ]
        ],
        zoomMaxCtrl: [
          this.defaultValuesService.getValue('map.layer.zoom.max'),
          [
            Validators.required, Validators.min(1), Validators.max(20)
          ]
        ],
        featuresMaxCtrl:
          [this.defaultValuesService.getValue('map.layer.max_feature'),
          [Validators.required, Validators.max(10000), Validators.min(0)]]
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
            Validators.required)],
          colorGeneratedFieldCtrl: ['', CustomValidators.getConditionalValidator(
            () => !!this.modeFormGroup ? this.colorSourceCtrl().value === 'generated' : false,
            Validators.required)],
          colorSetFieldCtrl: ['', CustomValidators.getConditionalValidator(
            () => !!this.modeFormGroup ? this.colorSourceCtrl().value === 'manual' : false,
            Validators.required)],
          colorSetValuesCtrl: this.formBuilder.array([], [CustomValidators
            .getConditionalValidator(
              () => !!this.modeFormGroup ? this.colorSourceCtrl().value === 'manual' : false,
              Validators.required)
          ])
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
    this.colorSourceCtrl().valueChanges.subscribe(value => {
      Object.keys(this.choosenColorGrp().controls).forEach(k =>
        this.choosenColorGrp().get(k).updateValueAndValidity()
      );
    });

    // in manual color mode, update the keywords when source field is changed
    this.colorSetFieldCtrl().valueChanges.subscribe(v => {
      this.colorSetValuesCtrl().clear();
      const keywords = ['toto', 'tata'];
      keywords.forEach(k => {
        const keywordColorGrp = this.formBuilder.group({
          keyword: [''],
          color: ['']
        });
        keywordColorGrp.setValue({ keyword: k, color: '#ffffff' });
        this.colorSetValuesCtrl().push(keywordColorGrp);
      });
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

  public colorSetFieldCtrl() {
    return this.choosenColorGrp().get('colorSetFieldCtrl');
  }

  public colorSetValuesCtrl() {
    return this.choosenColorGrp().get('colorSetValuesCtrl') as FormArray;
  }

  public openColorTable() {
    const dialogRef = this.dialog.open(DialogColorTableComponent, {
      data: this.colorSetValuesCtrl().value as KeywordColor[],
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.colorSetValuesCtrl().setValue(result);
      }
    });
  }
}
