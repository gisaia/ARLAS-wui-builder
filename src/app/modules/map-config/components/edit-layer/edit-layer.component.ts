import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MainFormService } from '@services/main-form/main-form.service';
import { CanComponentExit } from '@app/guards/confirm-exit.guard';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-edit-layer',
  templateUrl: './edit-layer.component.html',
  styleUrls: ['./edit-layer.component.scss']
})
export class EditLayerComponent implements OnInit, CanComponentExit {

  public layerFormGroup: FormGroup;
  private sharedLayersFormGroup: FormArray;
  private sharedLayersFormGroupValues: any[] = [];
  public forceCanExit: boolean;
  public submitSubject: Subject<void> = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private mainFormService: MainFormService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar) { }

  ngOnInit() {

    this.layerFormGroup = this.formBuilder.group({
      name: ['', Validators.required],
      mode: ['', Validators.required],
      id: [''],
      modeFormGroup: ['', Validators.required]
    });

    this.sharedLayersFormGroup = this.mainFormService.getMapConfigLayersForm();

    if (this.sharedLayersFormGroup == null) {
      this.snackBar.open('Error initializing the page');
      this.navigateToParentPage();
    } else {

      this.sharedLayersFormGroupValues = this.sharedLayersFormGroup.value as any[];
      this.route.paramMap.subscribe(params => {
        const layerId = params.get('id');
        if (layerId != null) {
          const formGroupIndex = this.getSharedLayerFormIndex(Number(layerId));
          if (formGroupIndex >= 0) {
            this.layerFormGroup.patchValue(this.getSharedLayerFormGroup(formGroupIndex).value);
          } else {
            this.navigateToParentPage();
            this.snackBar.open('Unknown layer ID');
          }
        }
      });
    }
  }

  private navigateToParentPage() {
    this.router.navigate(['', 'map-config', 'layers']);
  }

  public submit() {

    // force validation check on mode subform
    this.submitSubject.next();
    if (!this.layerFormGroup.valid) {
      console.log('validation failed', this.layerFormGroup);
      return;
    }

    if (!this.isNewLayer()) {
      // delete current layer in order to recreate it with a new id
      const formGroupIndex = this.getSharedLayerFormIndex(this.layerFormGroup.get('id').value);
      if (formGroupIndex >= 0) {
        this.sharedLayersFormGroup.removeAt(formGroupIndex);
      } else {
        this.snackBar.open('There was an error while saving the layer');
      }
    }

    const newId = this.sharedLayersFormGroupValues.reduce((acc, val) => acc.id > val.id ? acc.id : val.id, 0) + 1;
    this.layerFormGroup.patchValue({ id: newId });
    this.sharedLayersFormGroup.insert(newId, this.layerFormGroup);

    this.layerFormGroup.markAsPristine();
    this.navigateToParentPage();
  }

  private getSharedLayerFormIndex(id: number) {
    return this.sharedLayersFormGroupValues.findIndex(el => el.id === id);
  }

  private getSharedLayerFormGroup(index: number) {
    return (this.sharedLayersFormGroup.at(index) as FormGroup);
  }

  public isNewLayer(): boolean {
    return this.layerFormGroup.get('id').value === '';
  }

  public canExit() {
    return this.forceCanExit || this.layerFormGroup.pristine;
  }

}
