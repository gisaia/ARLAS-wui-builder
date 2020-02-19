import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MainFormService } from '@services/main-form/main-form.service';

@Component({
  selector: 'app-edit-layer',
  templateUrl: './edit-layer.component.html',
  styleUrls: ['./edit-layer.component.scss']
})
export class EditLayerComponent implements OnInit {

  private layerFormGroup: FormGroup;
  private sharedLayersFormGroup: FormArray;
  private sharedLayersFormGroupValues: any[] = [];

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
          const formGroupIndex = this.getSharedLayerFormIndex(layerId);
          if (formGroupIndex >= 0) {
            this.layerFormGroup.setValue(this.getSharedLayerFormGroup(formGroupIndex).value);
          } else {
            this.navigateToParentPage();
            this.snackBar.open('Unknown layer ID');
          }
        }
      });
    }
  }

  public getLayerFormGroup() {
    return this.layerFormGroup;
  }

  private navigateToParentPage() {
    this.router.navigate(['', 'map-config', 'layers']);
  }

  public submit() {

    if (!this.layerFormGroup.valid) {
      return;
    }

    if (this.layerFormGroup.get('id').value === '') {
      const newId = this.sharedLayersFormGroupValues.reduce((acc, val) => acc.id > val.id ? acc.id : val.id, 0) + 1;
      this.layerFormGroup.patchValue({ id: newId });
      (this.sharedLayersFormGroup).insert(newId, this.layerFormGroup);

    } else {
      const formGroupIndex = this.getSharedLayerFormIndex(this.layerFormGroup.get('id').value);

      if (formGroupIndex >= 0) {
        this.getSharedLayerFormGroup(formGroupIndex).setValue(this.layerFormGroup.value);
      } else {
        this.snackBar.open('There was an error while saving the layer');
      }
    }
    this.navigateToParentPage();
  }

  private getSharedLayerFormIndex(id: string) {
    return this.sharedLayersFormGroupValues.findIndex(el => el.id === id);
  }

  private getSharedLayerFormGroup(index: number) {
    return (this.sharedLayersFormGroup.at(index) as FormGroup);
  }

}
