import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';
import { NGXLogger } from 'ngx-logger';
import { FormArray, FormBuilder, Validators, AbstractControl, FormGroup } from '@angular/forms';

export interface KeywordColor {
  keyword: string;
  color: string;
}

@Component({
  selector: 'app-dialog-color-table',
  templateUrl: './dialog-color-table.component.html',
  styleUrls: ['./dialog-color-table.component.scss']
})
export class DialogColorTableComponent implements OnInit {

  public keywordColorsForm: FormArray;
  public dataSource: MatTableDataSource<AbstractControl>;
  public displayedColumns = ['keyword', 'color'];

  constructor(
    public dialogRef: MatDialogRef<DialogColorTableComponent>,
    @Inject(MAT_DIALOG_DATA) public data: KeywordColor[],
    private logger: NGXLogger,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.dialogRef.disableClose = true;
    this.dialogRef.updateSize('600px');

    // build the form with all keywords / colors
    this.keywordColorsForm = this.formBuilder.array([]);
    this.data.forEach(v => {
      const keywordColorGrp = this.formBuilder.group({
        keyword: [''],
        color: ['']
      });
      keywordColorGrp.setValue(v);
      this.keywordColorsForm.push(keywordColorGrp);
    });
    this.dataSource = new MatTableDataSource(this.keywordColorsForm.controls);
  }

  public onCancel(): void {
    this.dialogRef.close();
  }

  public reset(fg: FormGroup) {
    fg.get('color').setValue('#ffffff');
  }


}
