import { Component, OnInit } from '@angular/core';
import { FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MainFormService } from '@services/main-form/main-form.service';
import { ConfirmModalComponent } from '@app/shared/components/confirm-modal/confirm-modal.component';

export interface Layer {
  id: string;
  name: string;
  mode: string;
}

@Component({
  selector: 'app-layers',
  templateUrl: './layers.component.html',
  styleUrls: ['./layers.component.scss']
})
export class LayersComponent implements OnInit {

  public displayedColumns: string[] = ['name', 'mode', 'edit', 'delete'];

  constructor(private mainFormService: MainFormService, public dialog: MatDialog) { }

  ngOnInit() {
    if (this.getMapLayersFormGroup() == null) {
      this.mainFormService.mainForm.addControl('MapConfigLayers', new FormArray([]));
    }
  }


  public getLayers() {
    return this.getMapLayersFormGroup().value;
  }

  public confirmDelete(layerId: number, layerName: string): void {
    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '400px',
      data: { message: 'delete the layer ' + layerName + '?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const formGroupIndex = (this.getMapLayersFormGroup().value as any[]).findIndex(el => el.id === layerId);
        this.getMapLayersFormGroup().removeAt(formGroupIndex);
      }
    });
  }

  private getMapLayersFormGroup() {
    return this.mainFormService.mainForm.get('MapConfigLayers') as FormArray;
  }

}
